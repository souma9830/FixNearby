# FixNearby Production Deployment & Operations Guide

## Infrastructure Requirements
* Node.js v18+ LTS Runtime
* MongoDB 6.0+ Cluster with 2dsphere indexing support
* Redis Server 7.0+ for BullMQ background workers and rate-limiting
* Docker & Docker Compose (optional for containerized deployments)

## Environment Variables Configuration

```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/fixnearby
REDIS_URL=redis://default:<password>@redis-server:6379
JWT_SECRET=super_secret_production_key_min_64_chars
CORS_ALLOWED_ORIGINS=https://fixnearby.com,https://app.fixnearby.com
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Production Docker Deployment
```bash
docker compose -f docker-compose.yml up -d --build
```
