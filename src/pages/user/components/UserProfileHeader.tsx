import React from "react";
import { Mail, Calendar, Briefcase, MapPin } from "lucide-react";
import { UserPerformanceDetailResponse } from "../../../api/adminAudit";

interface UserProfileHeaderProps {
  name: string;
  email: string;
  avatar: string;
  role: string;
  phoneNumber: string;
  joinedDate?: string;
  userDetail: UserPerformanceDetailResponse | null;
}

export const UserProfileHeader: React.FC<UserProfileHeaderProps> = ({
  name,
  email,
  avatar,
  role,
  joinedDate,
  userDetail,
}) => {
  const totalOps = userDetail
    ? userDetail.summary.totalOrderActions +
      userDetail.summary.totalProductAdjustments
    : null;

  const stats = userDetail
    ? [
        { value: totalOps?.toLocaleString() ?? "—", label: "All time ops" },
        {
          value: userDetail.summary.totalOrderActions.toLocaleString(),
          label: "Order actions",
        },
        {
          value: userDetail.summary.totalProductAdjustments.toLocaleString(),
          label: "Stock adjustments",
        },
      ]
    : [];

  return (
    <div className='md:p-6 p-1' style={styles.root}>
      {/* Ambient blobs — same palette as the panel system */}
      <div style={{ ...styles.blob, ...styles.blob1 }} />
      <div style={{ ...styles.blob, ...styles.blob2 }} />
      <div style={{ ...styles.blob, ...styles.blob3 }} />

      {/* Glass card */}
      <div className='max-w-4xl mx-auto' style={styles.card}>
        {/* Top shimmer edge */}
        <div style={styles.shimmer} />

        <div style={styles.content}>
          {/* ── Avatar ── */}
          <div style={styles.avatarWrap}>
            {avatar ? (
              <img src={avatar} alt={name} style={styles.avatarImg} />
            ) : (
              <span style={styles.avatarFallback}>
                {name.charAt(0).toUpperCase()}
              </span>
            )}
            {/* Online dot */}
            <div style={styles.onlineDot} />
          </div>

          {/* ── Name ── */}
          <h1 style={styles.name}>{name}</h1>

          {/* ── Role chip ── */}
          <div style={styles.roleChip}>
            <Briefcase size={12} color='#6366f1' />
            <span>{role}</span>
          </div>

          {/* ── Email + joined ── */}
          <div style={styles.metaRow}>
            <Mail size={13} color='#818cf8' />
            <span style={styles.metaText}>{email}</span>
            {joinedDate && (
              <>
                <span style={styles.metaDot} />
                <Calendar size={13} color='#818cf8' />
                <span style={styles.metaText}>{joinedDate}</span>
              </>
            )}
          </div>

          {/* ── Stats panel ── */}
          {stats.length > 0 && (
            <div style={styles.statsPanel}>
              {stats.map((stat, i) => (
                <React.Fragment key={i}>
                  <div style={styles.statCell}>
                    <span style={styles.statValue}>{stat.value}</span>
                    <span style={styles.statLabel}>{stat.label}</span>
                  </div>
                  {i < stats.length - 1 && <div style={styles.statDivider} />}
                </React.Fragment>
              ))}
            </div>
          )}

          {/* ── Location ── */}
          <div style={styles.location}>
            <MapPin size={12} color='#a5b4fc' />
            <span>Dhaka, Bangladesh</span>
          </div>
        </div>
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
    borderRadius: 28,
    overflow: "hidden",
    background:
      "linear-gradient(135deg, #eef2ff 0%, #f0fdf4 50%, #faf5ff 100%)",
  },

  /* Blobs */
  blob: {
    position: "absolute",
    borderRadius: "50%",
    filter: "blur(65px)",
    pointerEvents: "none",
    zIndex: 0,
  },
  blob1: {
    width: 340,
    height: 340,
    background: "rgba(99,102,241,0.20)",
    top: -100,
    right: -80,
  },
  blob2: {
    width: 260,
    height: 260,
    background: "rgba(16,185,129,0.12)",
    bottom: -80,
    left: -60,
  },
  blob3: {
    width: 200,
    height: 200,
    background: "rgba(124,58,237,0.10)",
    top: "35%",
    right: "20%",
  },

  /* Glass card */
  card: {
    position: "relative",
    zIndex: 1,
    background: "rgba(255,255,255,0.55)",
    border: "1px solid rgba(255,255,255,0.82)",
    borderRadius: 24,
    backdropFilter: "blur(20px) saturate(1.7)",
    WebkitBackdropFilter: "blur(20px) saturate(1.7)",
    boxShadow:
      "0 8px 32px rgba(99,102,241,0.10), 0 2px 8px rgba(99,102,241,0.06), inset 0 1px 0 rgba(255,255,255,0.90)",
    overflow: "hidden",
  },

  shimmer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    background:
      "linear-gradient(90deg, transparent, rgba(255,255,255,0.95), transparent)",
    zIndex: 2,
  },

  content: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "2rem 1.5rem 1.75rem",
    gap: 0,
  },

  /* Avatar */
  avatarWrap: {
    position: "relative",
    width: 96,
    height: 96,
    marginBottom: 16,
    flexShrink: 0,
  },
  avatarImg: {
    width: 96,
    height: 96,
    borderRadius: "50%",
    objectFit: "cover",
    display: "block",
    border: "3px solid rgba(255,255,255,0.95)",
    boxShadow: "0 6px 24px rgba(99,102,241,0.22), 0 2px 8px rgba(0,0,0,0.08)",
  },
  avatarFallback: {
    width: 96,
    height: 96,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #818cf8, #6366f1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 34,
    fontWeight: 600,
    color: "#fff",
    border: "3px solid rgba(255,255,255,0.95)",
    boxShadow: "0 6px 24px rgba(99,102,241,0.28)",
  } as React.CSSProperties,
  onlineDot: {
    position: "absolute",
    bottom: 5,
    right: 5,
    width: 16,
    height: 16,
    borderRadius: "50%",
    background: "#34d399",
    border: "2.5px solid rgba(255,255,255,0.95)",
    boxShadow: "0 0 8px rgba(52,211,153,0.55)",
  },

  /* Name */
  name: {
    fontSize: 24,
    fontWeight: 700,
    color: "#1e1b4b",
    margin: "0 0 10px",
    textAlign: "center",
    lineHeight: 1.2,
    letterSpacing: "-0.3px",
  },

  /* Role chip */
  roleChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "5px 14px",
    borderRadius: 99,
    background: "rgba(99,102,241,0.09)",
    border: "1px solid rgba(99,102,241,0.20)",
    fontSize: 11,
    fontWeight: 600,
    color: "#4338ca",
    textTransform: "uppercase",
    letterSpacing: "0.6px",
    marginBottom: 14,
  } as React.CSSProperties,

  /* Meta row */
  metaRow: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 20,
  },
  metaText: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: 400,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: "50%",
    background: "#d1d5db",
    flexShrink: 0,
  },

  /* Stats panel */
  statsPanel: {
    width: "100%",
    maxWidth: 360,
    display: "flex",
    alignItems: "stretch",
    background: "rgba(255,255,255,0.60)",
    border: "1px solid rgba(255,255,255,0.88)",
    borderRadius: 16,
    boxShadow:
      "0 2px 12px rgba(99,102,241,0.07), inset 0 1px 0 rgba(255,255,255,0.85)",
    overflow: "hidden",
    marginBottom: 16,
  },
  statCell: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "14px 8px",
    gap: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 700,
    color: "#1e1b4b",
    lineHeight: 1,
    letterSpacing: "-0.3px",
  },
  statLabel: {
    fontSize: 10,
    fontWeight: 600,
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: "0.4px",
    textAlign: "center",
  } as React.CSSProperties,
  statDivider: {
    width: 1,
    background: "rgba(99,102,241,0.10)",
    alignSelf: "stretch",
    margin: "10px 0",
  },

  /* Location */
  location: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    fontSize: 12,
    color: "#9ca3af",
    fontWeight: 500,
  },
};
