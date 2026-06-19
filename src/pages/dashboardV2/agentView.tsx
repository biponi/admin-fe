import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { navItems } from "../../utils/navItem";
import useLoginAuth from "../auth/hooks/useLoginAuth";
import useRoleCheck from "../auth/hooks/useRoleCheck";
import { ChevronRight, Activity, LayoutGrid } from "lucide-react";
import MainView from "@/coreComponents/mainView";

interface PageCard {
  title: string;
  url: string;
  icon: React.ReactNode;
  isActive: boolean;
  id: string;
}

const AgentView: React.FC = () => {
  const { user } = useLoginAuth();
  const { hasRequiredPermission } = useRoleCheck();
  const pathName = useLocation().pathname;
  const navigate = useNavigate();

  const filteredNavItems: PageCard[] = navItems
    .filter((nav) => nav.active && hasRequiredPermission(nav.id, "view"))
    .map((item) => ({
      title: item.title,
      url: item.link,
      icon: item.icon,
      isActive: pathName.includes(item.link),
      id: item.id,
    }));

  if (!user) {
    return (
      <MainView title='Dashboard'>
        <div style={styles.loadingWrap}>
          <div style={styles.spinner} />
          <p style={styles.loadingText}>Loading user data...</p>
        </div>
      </MainView>
    );
  }

  return (
    <MainView title='Dashboard'>
      <div style={styles.root}>
        {/* Ambient blobs */}
        <div style={{ ...styles.blob, ...styles.blob1 }} />
        <div style={{ ...styles.blob, ...styles.blob2 }} />
        <div style={{ ...styles.blob, ...styles.blob3 }} />

        <div style={styles.inner}>
          {/* ── Header ── */}
          <div style={styles.headerRow}>
            <div style={styles.headerLeft}>
              <div style={styles.headerIconWrap}>
                <Activity size={20} color='#6366f1' />
              </div>
              <div>
                <h1 style={styles.headerTitle}>
                  Welcome back, {user?.name || "Agent"}
                </h1>
                <p style={styles.headerSub}>
                  Access your available modules and manage your tasks
                </p>
              </div>
            </div>
          </div>

          {/* ── Summary strip ── */}
          <div style={styles.stripGrid}>
            <StatPill
              color='#6366f1'
              dotColor='rgba(99,102,241,0.7)'
              value={filteredNavItems.length}
              label='Available modules'
            />
            <StatPill
              color='#059669'
              dotColor='rgba(16,185,129,0.7)'
              value={filteredNavItems.filter((i) => i.isActive).length}
              label='Currently active'
            />
            <StatPill
              color='#7c3aed'
              dotColor='rgba(124,58,237,0.7)'
              value={user?.role || "Agent"}
              label='Your access level'
              truncate
            />
          </div>

          {/* ── Cards ── */}
          {filteredNavItems.length === 0 ? (
            <div style={styles.emptyCard}>
              <div style={styles.emptyIconWrap}>
                <LayoutGrid size={28} color='rgba(99,102,241,0.35)' />
              </div>
              <h3 style={styles.emptyTitle}>No modules available</h3>
              <p style={styles.emptySub}>
                You don't have access to any modules yet. Contact your
                administrator to get the necessary permissions.
              </p>
            </div>
          ) : (
            <div style={styles.cardGrid}>
              {filteredNavItems.map((item) => (
                <ModuleCard
                  key={item.id}
                  item={item}
                  onClick={() => navigate(item.url)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </MainView>
  );
};

/* ─────────────────────────────────────────
   Sub-components
───────────────────────────────────────── */

const StatPill: React.FC<{
  color: string;
  dotColor: string;
  value: string | number;
  label: string;
  truncate?: boolean;
}> = ({ color, dotColor, value, label, truncate }) => (
  <div style={styles.statPill}>
    <div style={{ ...styles.statDot, background: dotColor }} />
    <div style={{ minWidth: 0 }}>
      <p
        style={{
          ...styles.statValue,
          color,
          ...(truncate
            ? {
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }
            : {}),
        }}>
        {value}
      </p>
      <p style={styles.statLabel}>{label}</p>
    </div>
  </div>
);

const ModuleCard: React.FC<{
  item: PageCard;
  onClick: () => void;
}> = ({ item, onClick }) => {
  const [hovered, setHovered] = React.useState(false);

  return (
    <div
      style={{
        ...styles.moduleCard,
        ...(item.isActive ? styles.moduleCardActive : {}),
        ...(hovered ? styles.moduleCardHovered : {}),
      }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}>
      {/* Active pulse dot */}
      {item.isActive && <div style={styles.activeDot} />}

      {/* Glass shimmer edge */}
      <div style={styles.cardShimmer} />

      {/* Icon */}
      <div
        style={{
          ...styles.moduleIconWrap,
          ...(hovered ? styles.moduleIconWrapHovered : {}),
        }}>
        {React.cloneElement(item.icon as React.ReactElement, {
          style: { width: 22, height: 22, color: "#6366f1" },
        })}
      </div>

      {/* Content */}
      <div style={styles.moduleContent}>
        <h3 style={styles.moduleTitle}>{item.title}</h3>
        <p style={styles.moduleSub}>
          Manage {item.title.toLowerCase()} tasks and data
        </p>
      </div>

      {/* Arrow */}
      <div
        style={{
          ...styles.arrowWrap,
          ...(hovered ? styles.arrowWrapVisible : {}),
        }}>
        <ChevronRight size={16} color='#818cf8' />
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   Styles
───────────────────────────────────────── */

const styles: Record<string, React.CSSProperties> = {
  root: {
    position: "relative",
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #eef2ff 0%, #f0fdf4 50%, #faf5ff 100%)",
    overflow: "hidden",
  },

  blob: {
    position: "absolute",
    borderRadius: "50%",
    filter: "blur(70px)",
    pointerEvents: "none",
    zIndex: 0,
  },
  blob1: {
    width: 420,
    height: 420,
    background: "rgba(99,102,241,0.15)",
    top: -120,
    right: -80,
  },
  blob2: {
    width: 300,
    height: 300,
    background: "rgba(16,185,129,0.10)",
    bottom: 60,
    left: -60,
  },
  blob3: {
    width: 260,
    height: 260,
    background: "rgba(124,58,237,0.09)",
    top: "40%",
    right: "15%",
  },

  inner: {
    position: "relative",
    zIndex: 1,
    maxWidth: 1200,
    margin: "0 auto",
    padding: "2rem 1.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },

  /* Header */
  headerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 12,
  },
  headerLeft: { display: "flex", alignItems: "center", gap: 14 },
  headerIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    background: "rgba(255,255,255,0.65)",
    border: "1px solid rgba(255,255,255,0.9)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 14px rgba(99,102,241,0.15)",
    flexShrink: 0,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 600,
    color: "#1e1b4b",
    margin: 0,
    lineHeight: 1.3,
  },
  headerSub: {
    fontSize: 13,
    color: "#6b7280",
    margin: "2px 0 0",
  },

  /* Stat pills */
  stripGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 12,
  },
  statPill: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 16px",
    background: "rgba(255,255,255,0.60)",
    border: "1px solid rgba(255,255,255,0.85)",
    borderRadius: 16,
    backdropFilter: "blur(16px) saturate(1.5)",
    WebkitBackdropFilter: "blur(16px) saturate(1.5)",
    boxShadow:
      "0 2px 12px rgba(99,102,241,0.07), inset 0 1px 0 rgba(255,255,255,0.8)",
  },
  statDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    flexShrink: 0,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 600,
    lineHeight: 1,
    margin: 0,
  },
  statLabel: {
    fontSize: 11,
    color: "#9ca3af",
    margin: "3px 0 0",
    fontWeight: 500,
  },

  /* Empty state */
  emptyCard: {
    textAlign: "center",
    padding: "4rem 2rem",
    background: "rgba(255,255,255,0.55)",
    border: "1px solid rgba(255,255,255,0.82)",
    borderRadius: 24,
    backdropFilter: "blur(18px) saturate(1.5)",
    WebkitBackdropFilter: "blur(18px) saturate(1.5)",
    boxShadow: "0 4px 24px rgba(99,102,241,0.07)",
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 18,
    background: "rgba(99,102,241,0.07)",
    border: "1px solid rgba(99,102,241,0.12)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 1rem",
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: "#374151",
    margin: "0 0 6px",
  },
  emptySub: {
    fontSize: 13,
    color: "#9ca3af",
    maxWidth: 380,
    margin: "0 auto",
    lineHeight: 1.6,
  },

  /* Module card grid */
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: 16,
  },

  moduleCard: {
    position: "relative",
    padding: "1.25rem",
    background: "rgba(255,255,255,0.55)",
    border: "1px solid rgba(255,255,255,0.82)",
    borderRadius: 20,
    backdropFilter: "blur(18px) saturate(1.6)",
    WebkitBackdropFilter: "blur(18px) saturate(1.6)",
    boxShadow:
      "0 2px 12px rgba(99,102,241,0.07), inset 0 1px 0 rgba(255,255,255,0.85)",
    cursor: "pointer",
    overflow: "hidden",
    transition: "transform 0.2s, box-shadow 0.2s, background 0.2s",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  moduleCardActive: {
    border: "1px solid rgba(99,102,241,0.35)",
    boxShadow:
      "0 4px 20px rgba(99,102,241,0.14), 0 0 0 3px rgba(99,102,241,0.08), inset 0 1px 0 rgba(255,255,255,0.9)",
  },
  moduleCardHovered: {
    transform: "translateY(-3px) scale(1.01)",
    background: "rgba(255,255,255,0.75)",
    boxShadow:
      "0 8px 28px rgba(99,102,241,0.14), inset 0 1px 0 rgba(255,255,255,0.95)",
  },

  cardShimmer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    background:
      "linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent)",
    borderRadius: "20px 20px 0 0",
  },

  activeDot: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#6366f1",
    boxShadow: "0 0 0 3px rgba(99,102,241,0.2)",
    animation: "pulse 2s infinite",
  },

  moduleIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    background: "rgba(99,102,241,0.09)",
    border: "1px solid rgba(99,102,241,0.14)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "transform 0.2s, background 0.2s",
    flexShrink: 0,
  },
  moduleIconWrapHovered: {
    background: "rgba(99,102,241,0.15)",
    transform: "scale(1.08)",
  },

  moduleContent: { flex: 1 },
  moduleTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: "#1e1b4b",
    margin: "0 0 4px",
    lineHeight: 1.3,
  },
  moduleSub: {
    fontSize: 12,
    color: "#9ca3af",
    margin: 0,
    lineHeight: 1.5,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  } as React.CSSProperties,

  arrowWrap: {
    position: "absolute",
    bottom: 14,
    right: 14,
    opacity: 0,
    transform: "translateX(6px)",
    transition: "opacity 0.2s, transform 0.2s",
  },
  arrowWrapVisible: {
    opacity: 1,
    transform: "translateX(0)",
  },

  /* Loading */
  loadingWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "60vh",
    gap: 16,
  },
  spinner: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    border: "3px solid rgba(99,102,241,0.15)",
    borderTopColor: "#6366f1",
    animation: "spin 0.8s linear infinite",
  },
  loadingText: {
    fontSize: 14,
    color: "#9ca3af",
    margin: 0,
  },
};

export default AgentView;
