import { format } from 'date-fns';

export type MonthTuple = [year: number, month: number];

export const monthKeyToTuple = (key: string): MonthTuple => {
  const [y, m] = key.split('-').map(Number);
  return [y, m];
};

export const tupleToMonthKey = ([y, m]: MonthTuple): string =>
  `${y}-${String(m).padStart(2, '0')}`;

export const incrementMonth = ([y, m]: MonthTuple): MonthTuple =>
  m === 12 ? [y + 1, 1] : [y, m + 1];

const compareTuples = (a: MonthTuple, b: MonthTuple): number =>
  a[0] - b[0] || a[1] - b[1];

export const fillRange = (keys: string[]): string[] => {
  if (keys.length <= 1) return [...keys];
  const tuples = keys.map(monthKeyToTuple);
  const min = tuples.reduce((acc, t) => (compareTuples(t, acc) < 0 ? t : acc));
  const max = tuples.reduce((acc, t) => (compareTuples(t, acc) > 0 ? t : acc));
  const out: string[] = [];
  for (
    let cursor: MonthTuple = min;
    compareTuples(cursor, max) <= 0;
    cursor = incrementMonth(cursor)
  ) {
    out.push(tupleToMonthKey(cursor));
  }
  return out;
};

// Keep the largest contiguous block of remaining keys; ties go to the rightmost.
export const trimToContiguous = (keys: string[], removed: string): string[] => {
  const remaining = keys.filter((k) => k !== removed);
  if (remaining.length === 0) return [];
  const sorted = [...remaining].sort();

  const segments: string[][] = [[sorted[0]]];
  for (let i = 1; i < sorted.length; i++) {
    const adjacent =
      tupleToMonthKey(incrementMonth(monthKeyToTuple(sorted[i - 1]))) === sorted[i];
    if (adjacent) segments[segments.length - 1].push(sorted[i]);
    else segments.push([sorted[i]]);
  }

  let winner = segments[segments.length - 1];
  for (let i = segments.length - 2; i >= 0; i--) {
    if (segments[i].length > winner.length) winner = segments[i];
  }
  return winner;
};

export const formatCohortRangeLabel = (keys: string[]): string => {
  if (keys.length === 0) return '';
  const sorted = [...keys].sort();
  const [firstY, firstM] = monthKeyToTuple(sorted[0]);
  const [lastY, lastM] = monthKeyToTuple(sorted[sorted.length - 1]);
  const firstDate = new Date(firstY, firstM - 1, 1);
  const lastDate = new Date(lastY, lastM - 1, 1);
  if (sorted.length === 1) return format(firstDate, 'MMM yyyy');
  if (firstY === lastY) {
    return `${format(firstDate, 'MMM')} – ${format(lastDate, 'MMM yyyy')}`;
  }
  return `${format(firstDate, 'MMM yyyy')} – ${format(lastDate, 'MMM yyyy')}`;
};

export const getLatestCohortKey = (keys: string[]): string => {
  if (keys.length === 0) {
    throw new Error('getLatestCohortKey called with empty array');
  }
  return [...keys].sort().slice(-1)[0];
};
