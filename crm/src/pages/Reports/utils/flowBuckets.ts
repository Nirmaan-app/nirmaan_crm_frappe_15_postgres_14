import { STATUS_GROUP, type CanonicalStatus } from './cohortStatusGroups';

export type FlowBucketKey =
  | 'received'
  | 'active'
  | 'won'
  | 'lost'
  | 'negotiationHold';
export type FlowBucketRow = 'primary' | 'secondary';
export type FlowBucketAccent = 'destructive' | 'success' | 'muted';

export interface FlowBucketDef {
  key: FlowBucketKey;
  label: string;
  statuses: readonly CanonicalStatus[] | null;
  row: FlowBucketRow;
  accent?: FlowBucketAccent;
  tooltip?: string;
}

const ACTIVE_STATUSES: readonly CanonicalStatus[] = [
  'New',
  'In-Progress',
  'Partially Submitted',
  'Submitted',
];

export const FLOW_BUCKETS: readonly FlowBucketDef[] = [
  {
    key: 'received',
    label: 'Projects Received',
    statuses: null,
    row: 'primary',
  },
  {
    key: 'won',
    label: 'Deals Won',
    statuses: STATUS_GROUP.won,
    row: 'primary',
    accent: 'success',
  },
  {
    key: 'lost',
    label: 'Deals Lost',
    statuses: STATUS_GROUP.lost,
    row: 'primary',
    accent: 'muted',
    tooltip: `Includes: ${STATUS_GROUP.lost.join(', ')}`,
  },
  {
    key: 'active',
    label: 'Active / In-Flight',
    statuses: ACTIVE_STATUSES,
    row: 'secondary',
    tooltip: `Includes: ${ACTIVE_STATUSES.join(', ')}`,
  },
  {
    key: 'negotiationHold',
    label: 'In Negotiation / Hold',
    statuses: ['Negotiation', 'Hold'] as readonly CanonicalStatus[],
    row: 'secondary',
    tooltip: 'Includes: Negotiation, Hold',
  },
];

const byKey = (k: FlowBucketKey) => FLOW_BUCKETS.find((b) => b.key === k)!;

// Sequential funnel ordering (top → bottom). Edit this array
// to change the funnel's stage order or set of stages.
export const FUNNEL_STAGES: readonly FlowBucketDef[] = [
  byKey('received'),
  byKey('active'),
  byKey('negotiationHold'),
  byKey('won'),
];

// Drop-off buckets — peeled off from the funnel, rendered separately.
export const FUNNEL_DROPS: readonly FlowBucketDef[] = [byKey('lost')];
