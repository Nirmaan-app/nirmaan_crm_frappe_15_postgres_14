import { STATUS_GROUP, type CanonicalStatus } from './cohortStatusGroups';

export type FlowBucketKey = 'received' | 'won' | 'lost' | 'negotiationHold';
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
    accent: 'destructive',
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
    key: 'negotiationHold',
    label: 'In Negotiation / Hold',
    statuses: ['Negotiation', 'Hold'] as readonly CanonicalStatus[],
    row: 'secondary',
    tooltip: 'Includes: Negotiation, Hold',
  },
];
