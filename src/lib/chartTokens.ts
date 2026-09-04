/**
 * Standardized Chart Color Tokens for CyberGuardian Enterprise SaaS.
 * Provides CSS variable-backed and fallback hex color codes
 * aligned with the unified semantic color system.
 */

export const CHART_COLORS = {
  primary: 'var(--accent-primary, #3B82F6)',
  ai: 'var(--accent-ai, #06B6D4)',
  success: 'var(--accent-success, #22C55E)',
  warning: 'var(--accent-warning, #F59E0B)',
  danger: 'var(--accent-danger, #EF4444)',
  info: 'var(--accent-info, #38BDF8)',
  activity: 'var(--accent-activity, #F97316)',
  grid: 'var(--border-subtle, rgba(148, 163, 184, 0.12))',
  axis: 'var(--text-muted, #64748B)',
};

export const THREAT_PIE_PALETTE = [
  'var(--accent-danger, #EF4444)',
  'var(--accent-warning, #F59E0B)',
  'var(--accent-primary, #3B82F6)',
  'var(--accent-info, #38BDF8)',
  'var(--accent-activity, #F97316)',
];

export const getTooltipStyle = () => ({
  contentStyle: {
    backgroundColor: 'var(--bg-elevated)',
    border: '1px solid var(--border-medium)',
    borderRadius: '10px',
    fontSize: '11px',
    color: 'var(--text-primary)',
    boxShadow: 'var(--shadow-lg)',
  },
  labelStyle: {
    color: 'var(--text-secondary)',
    fontWeight: 600,
  },
});
