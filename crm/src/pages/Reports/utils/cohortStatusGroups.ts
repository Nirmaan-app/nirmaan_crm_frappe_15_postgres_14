export const CANONICAL_STATUSES = [
  'New',
  'In-Progress',
  'Partially Submitted',
  'Submitted',
  'Negotiation',
  'Won',
  'Hold',
  'Dropped',
  'Lost',
] as const;

export type CanonicalStatus = typeof CANONICAL_STATUSES[number];

export const LOCK_STATUSES = new Set<CanonicalStatus>([
  'Won',
  'Lost',
  'Dropped',
  'Hold',
  'Negotiation',
]);

export type StatusGroup = 'active' | 'won' | 'lost';

export const STATUS_GROUP: Record<StatusGroup, CanonicalStatus[]> = {
  active: ['New', 'In-Progress', 'Partially Submitted', 'Submitted', 'Negotiation', 'Hold'],
  won: ['Won'],
  lost: ['Lost', 'Dropped'],
};

export const getStatusGroup = (status: string): StatusGroup | 'unknown' => {
  for (const [group, statuses] of Object.entries(STATUS_GROUP) as [StatusGroup, CanonicalStatus[]][]) {
    if (statuses.includes(status as CanonicalStatus)) return group;
  }
  return 'unknown';
};

export const isLockStatus = (status: string): boolean =>
  LOCK_STATUSES.has(status as CanonicalStatus);
