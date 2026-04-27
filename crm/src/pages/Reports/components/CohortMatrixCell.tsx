import { useDialogStore } from '@/store/dialogStore';
import { boqNameFormatter } from '@/pages/Home/StatsGrid';
import { cn } from '@/lib/utils';
import type { CohortProjectRow } from '../types';

interface Props {
  boqNames: string[];
  monthLabel: string;
  status: string;
  projectsByName: Map<string, CohortProjectRow>;
  className?: string;
}

export const CohortMatrixCell = ({
  boqNames,
  monthLabel,
  status,
  projectsByName,
  className,
}: Props) => {
  const { openStatsDetailDialog } = useDialogStore();
  const count = boqNames.length;
  const isClickable = count > 0;

  const handleClick = () => {
    if (!isClickable) return;
    const items = boqNames
      .map(n => projectsByName.get(n))
      .filter((p): p is CohortProjectRow => p !== undefined)
      .map(p => ({
        name: boqNameFormatter(p),
        id: p.name,
        type: 'BOQ' as const,
        data: p,
      }));
    openStatsDetailDialog({
      title: `${monthLabel} • ${status} (${count})`,
      items,
    });
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        'px-4 py-3 text-center transition-colors',
        isClickable && 'cursor-pointer hover:bg-muted/50',
        className
      )}
    >
      <span
        className={cn(
          'tabular-nums text-base font-semibold',
          !isClickable && 'text-muted-foreground/40 font-normal'
        )}
      >
        {count}
      </span>
    </div>
  );
};
