export type FlowBucketKey =
  | 'received'
  | 'moved'
  | 'active'
  | 'negotiationHold'
  | 'won'
  | 'lost';

export type FlowBucketAccent = 'destructive' | 'success' | 'muted';

export interface FlowBucketDef {
  key: FlowBucketKey;
  label: string;
  accent?: FlowBucketAccent;
  tooltip?: string;
}

export const FLOW_BUCKETS: Record<FlowBucketKey, FlowBucketDef> = {
  received: {
    key: 'received',
    label: 'Projects Received',
  },
  moved: {
    key: 'moved',
    label: 'Projects Moved',
    tooltip: 'Unique projects with any status change in the selected window',
  },
  active: {
    key: 'active',
    label: 'Active / In-Flight',
    tooltip: 'Includes: New, In-Progress, Partially Submitted, Submitted',
  },
  negotiationHold: {
    key: 'negotiationHold',
    label: 'In Negotiation / Hold',
    tooltip: 'Includes: Negotiation, Hold',
  },
  won: {
    key: 'won',
    label: 'Deals Won',
    accent: 'success',
  },
  lost: {
    key: 'lost',
    label: 'Deals Lost',
    accent: 'muted',
    tooltip: 'Includes: Lost, Dropped',
  },
};
