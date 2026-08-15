// client/src/pages/SavedWorkers.jsx

import { useEffect, useState } from "react";
import { getFavorites, removeFavorite } from "../services/favoriteService";
import { useNavigate } from "react-router-dom";
import useToast from "../hooks/useToast";
import SkeletonLoader from "../components/SkeletonLoader";

const FAVORITES_CACHE_KEY = "favoritesCache";
const FAVORITES_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// ────────────────────────────────────────────────────────
//  Inline styles — no extra CSS file needed
// ────────────────────────────────────────────────────────
const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)",
    fontFamily: "'Segoe UI', 'Inter', sans-serif",
    padding: "40px 20px",
  },
  container: {
    maxWidth: "1100px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: "36px",
  },
  backBtn: {
    background: "#fff",
    border: "1.5px solid #dde1e7",
    borderRadius: "50px",
    padding: "8px 18px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    color: "#444",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    transition: "all 0.2s",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  title: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#1a1a2e",
    margin: 0,
  },
  subtitle: {
    fontSize: "14px",
    color: "#888",
    marginLeft: "auto",
    fontWeight: "500",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "24px",
  },
  card: {
    background: "#ffffff",
    borderRadius: "18px",
    padding: "24px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    transition: "transform 0.2s, box-shadow 0.2s",
    position: "relative",
    border: "1px solid #f0f2f5",
  },
  avatar: {
    width: "62px",
    height: "62px",
    borderRadius: "50%",
    objectFit: "cover",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    color: "#fff",
    fontWeight: "700",
    flexShrink: 0,
  },
  workerName: {
    fontSize: "17px",
    fontWeight: "700",
    color: "#1a1a2e",
    margin: 0,
  },
  skillBadge: {
    display: "inline-block",
    background: "linear-gradient(135deg, #667eea22, #764ba222)",
    color: "#5a4fcf",
    borderRadius: "50px",
    padding: "3px 12px",
    fontSize: "12px",
    fontWeight: "600",
    border: "1px solid #667eea33",
  },
  ratingRow: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
    color: "#666",
  },
  removeBtn: {
    position: "absolute",
    top: "16px",
    right: "16px",
    background: "none",
    border: "1px solid #ffd0d0",
    borderRadius: "50px",
    padding: "4px 12px",
    cursor: "pointer",
    fontSize: "12px",
    color: "#e55",
    fontWeight: "600",
    transition: "all 0.2s",
  },
  viewBtn: {
    marginTop: "auto",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    color: "#fff",
    border: "none",
    borderRadius: "50px",
    padding: "10px 20px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    width: "100%",
    transition: "opacity 0.2s",
  },
  emptyState: {
    textAlign: "center",
    padding: "80px 20px",
    color: "#aaa",
  },
  emptyIcon: { fontSize: "64px", marginBottom: "16px" },
  emptyTitle: { fontSize: "22px", fontWeight: "700", color: "#555", margin: "0 0 8px" },
  emptyText: { fontSize: "15px", color: "#aaa", margin: "0 0 24px" },
  exploreBtn: {
    background: "linear-gradient(135deg, #ff6b35, #f7931e)",
    color: "#fff",
    border: "none",
    borderRadius: "50px",
    padding: "12px 28px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "700",
    boxShadow: "0 4px 16px rgba(255,107,53,0.4)",
  },
  loader: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "200px",
    fontSize: "16px",
    color: "#888",
    gap: "10px",
  },
};

// ────────────────────────────────────────────────────────
//  Worker Card
// ────────────────────────────────────────────────────────
const WorkerCard = ({ favorite, onRemove }) => {
  const worker = favorite.worker;
  const initials = worker?.name
    ? worker.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "W";

  const navigate = useNavigate();

  const quickBook = () => {
    if (!worker?._id) return;
    navigate(`/worker/${worker._id}?quickBook=1`);
  };

  return (
    <div
      style={styles.card}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.13)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.08)";
      }}
    >

      {/* Remove button */}
      <button
        style={styles.removeBtn}
        onClick={() => onRemove(worker._id)}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#ffe0e0";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "none";
        }}
      >
        ✕ Remove
      </button>

      {/* Top row */}
      <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
        {worker.profilePic ? (
          <img src={worker.profilePic} alt={worker.name} style={styles.avatar} />
        ) : (
          <div style={styles.avatar}>{initials}</div>
        )}
        <div>
          <p style={styles.workerName}>{worker.name || "Worker"}</p>
          <span style={styles.skillBadge}>{worker.skill || worker.category || "Service"}</span>
        </div>
      </div>

      {/* Rating */}
      <div style={styles.ratingRow}>
        <span>⭐</span>
        <span style={{ fontWeight: "600", color: "#333" }}>
          {worker.rating ? worker.rating.toFixed(1) : "New"}
        </span>
        {worker.reviewCount && (
          <span style={{ color: "#aaa" }}>({worker.reviewCount} reviews)</span>
        )}
        {worker.location && (
          <>
            <span style={{ color: "#ddd", margin: "0 4px" }}>•</span>
            <span>📍 {worker.location}</span>
          </>
        )}
      </div>

      {/* Experience / Rate */}
      <div style={{ display: "flex", gap: "16px", fontSize: "13px", color: "#666" }}>
        {worker.experience && (
          <span>🏅 {worker.experience} yrs exp</span>
        )}
        {worker.hourlyRate && (
          <span>💰 ₹{worker.hourlyRate}/hr</span>
        )}
      </div>

      {/* Saved date */}
      <p style={{ fontSize: "11px", color: "#bbb", margin: 0 }}>
        🔖 Saved on {new Date(favorite.createdAt).toLocaleDateString("en-IN", {
          day: "numeric", month: "short", year: "numeric",
        })}
      </p>

      {/* Quick booking button */}
      <button
        style={styles.viewBtn}
        onClick={quickBook}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
      >
        Book now ⚡
      </button>

      {/* View Profile button */}
      <button
        style={{ ...styles.viewBtn, background: "#fff", color: "#4b4b6a", border: "1.5px solid #dde1e7", marginTop: "10px" }}
        onClick={() => navigate(`/worker/${worker._id}`)}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
      >
        View Profile →
      </button>

    </div>
  );
};

// ────────────────────────────────────────────────────────
//  Main Page
// ────────────────────────────────────────────────────────
const SavedWorkers = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    let cancelled = false;

    const loadCachedThenRefresh = async () => {
      try {
        const raw = localStorage.getItem(FAVORITES_CACHE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          const age = Date.now() - (parsed?.cachedAt || 0);
          if (Array.isArray(parsed?.favorites) && age < FAVORITES_CACHE_TTL_MS) {
            if (!cancelled) {
              setFavorites(parsed.favorites);
              setLoading(false);
            }
          }
        }
      } catch {
        // Ignore cache failures
      }

      try {
        const data = await getFavorites();
        if (!cancelled) {
          setFavorites(data);
          setLoading(false);
          localStorage.setItem(
            FAVORITES_CACHE_KEY,
            JSON.stringify({ cachedAt: Date.now(), favorites: data })
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message === "User not authenticated"
              ? "Please login to view your saved workers."
              : "Failed to load saved workers. Try again."
          );
          setLoading(false);
        }
      }
    };

    loadCachedThenRefresh();

    return () => {
      cancelled = true;
    };
  }, []);


  const handleRemove = async (workerId) => {
    try {
      await removeFavorite(workerId);
      const next = favorites.filter((fav) => fav.worker._id !== workerId);
      setFavorites(next);
      localStorage.setItem(
        FAVORITES_CACHE_KEY,
        JSON.stringify({ cachedAt: Date.now(), favorites: next })
      );
    } catch (err) {
      showToast("Failed to remove saved worker. Try again.", "error");
    }
  };


  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* Header */}
        <div style={styles.header}>
          <button
            style={styles.backBtn}
            onClick={() => navigate(-1)}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f5f5")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
          >
            ← Back
          </button>
          <h1 style={styles.title}>⭐ Saved Workers</h1>
          {!loading && !error && (
            <span style={styles.subtitle}>
              {favorites.length} worker{favorites.length !== 1 ? "s" : ""} saved
            </span>
          )}
        </div>

        {/* States */}
        {loading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <SkeletonLoader key={i} type="card" />
            ))}
          </div>
        )}

        {error && (
          <div style={{ ...styles.emptyState }}>
            <div style={styles.emptyIcon}>⚠️</div>
            <p style={styles.emptyTitle}>{error}</p>
            <button style={styles.exploreBtn} onClick={() => navigate("/login")}>
              Go to Login
            </button>
          </div>
        )}

        {!loading && !error && favorites.length === 0 && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🔖</div>
            <p style={styles.emptyTitle}>No saved workers yet</p>
            <p style={styles.emptyText}>
              Browse workers and tap the Save button to bookmark them here.
            </p>
            <button style={styles.exploreBtn} onClick={() => navigate("/workers")}>
              Explore Workers
            </button>
          </div>
        )}

        {!loading && !error && favorites.length > 0 && (
          <div style={styles.grid}>
            {favorites.map((fav) => (
              <WorkerCard key={fav._id} favorite={fav} onRemove={handleRemove} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default SavedWorkers;
