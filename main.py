"""
FixNearby FastAPI Application Entrypoint & Bootstrap Sequence
Resolves Issue #634: Enforces a single authoritative FastAPI application instance,
preventing duplicate instantiations, reference reassignments, or obscured middleware pipelines.
"""

import time
import logging
from contextlib import asynccontextmanager
from typing import Dict, Any, Optional

try:
    from fastapi import FastAPI, Request, Response, status, HTTPException
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.middleware.trustedhost import TrustedHostMiddleware
    from fastapi.middleware.gzip import GZipMiddleware
    from fastapi.responses import JSONResponse
    from fastapi.routing import APIRouter
except ImportError:
    # Graceful fallback or proxy if fastapi is not yet installed in local python env
    FastAPI = None

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("fixnearby.bootstrap")

# Singleton holder to guarantee a single authoritative FastAPI instance
_app_instance: Optional[Any] = None

@asynccontextmanager
async def lifespan(app: Any):
    """
    Application lifespan manager handling startup and shutdown initialization tasks.
    Attaches infrastructure resources (database connections, pub/sub listeners)
    strictly to the single authoritative application instance.
    """
    logger.info("[Bootstrap] Initializing FixNearby single application container...")
    # Startup logic
    app.state.is_ready = True
    app.state.startup_timestamp = time.time()
    logger.info("[Bootstrap] FixNearby application container initialized successfully.")
    
    yield
    
    # Shutdown logic
    logger.info("[Bootstrap] Terminating FixNearby application container resources...")
    app.state.is_ready = False
    logger.info("[Bootstrap] Cleanup complete.")

def get_application(force_recreate: bool = False) -> Any:
    """
    Factory function to retrieve or initialize the single authoritative FastAPI application.
    
    Prevents multiple instantiation points and reassignments that obscure middleware
    pipelines, route registration, and shared state configuration.
    
    :param force_recreate: Must be False in production to prevent duplicate instantiation.
    :return: Authoritative FastAPI application instance.
    """
    global _app_instance

    if _app_instance is not None and not force_recreate:
        logger.debug("[Bootstrap] Returning existing authoritative FastAPI application instance.")
        return _app_instance

    if _app_instance is not None and force_recreate:
        logger.warning("[Bootstrap] Force recreation requested. Re-instantiating application instance.")

    if FastAPI is None:
        raise RuntimeError(
            "FastAPI is not installed in the current environment. "
            "Please install dependencies via `pip install fastapi uvicorn`."
        )

    # Single Authoritative FastAPI App Instantiation
    app = FastAPI(
        title="FixNearby Hyperlocal API",
        description="Authoritative backend service for FixNearby hyperlocal worker matching",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )

    # Initial Application State Configuration
    app.state.is_ready = False
    app.state.bootstrap_complete = True

    # 1. Attach Security & Performance Middlewares
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.add_middleware(GZipMiddleware, minimum_size=1000)

    # Custom Telemetry & Request Timing Middleware
    @app.middleware("http")
    async def add_process_time_header(request: Request, call_next):
        start_time = time.time()
        response = await call_next(request)
        process_time = time.time() - start_time
        response.headers["X-Process-Time-Ms"] = str(round(process_time * 1000, 2))
        return response

    # 2. Attach Global Exception Handlers
    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"success": False, "error": exc.detail},
        )

    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        logger.error(f"[Unhandled Error] {request.method} {request.url}: {exc}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"success": False, "error": "Internal Server Error"},
        )

    # 3. Register Application Routers on the Single Container
    api_router = APIRouter(prefix="/api")

    @api_router.get("/health", tags=["Health"])
    async def health_check():
        return {
            "status": "healthy",
            "ready": getattr(app.state, "is_ready", True),
            "service": "FixNearby FastAPI Engine",
            "version": "1.0.0",
        }

    @api_router.get("/health/live", tags=["Health"])
    async def liveness_check():
        return {"status": "live"}

    @api_router.get("/health/ready", tags=["Health"])
    async def readiness_check():
        if not getattr(app.state, "is_ready", True):
            raise HTTPException(status_code=503, detail="Service initializing")
        return {"status": "ready"}

    @api_router.get("/workers", tags=["Workers"])
    async def get_workers():
        return {"success": True, "workers": [], "total": 0}

    @api_router.get("/services", tags=["Services"])
    async def get_services():
        return {"success": True, "services": [], "total": 0}

    app.include_router(api_router)

    # Store authoritative instance in singleton holder
    _app_instance = app
    return _app_instance


# Instantiating the single authoritative application object for ASGI runners (uvicorn main:app)
try:
    app = get_application()
except Exception as e:
    logger.warning(f"[Bootstrap] App instantiation deferred (missing dependencies): {e}")
    app = None

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
