import { useMemo } from 'react';
import { format, subMonths, startOfMonth } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export const CohortMonthSelector = ({ value, onChange }: Props) => {
  const options = useMemo(() => {
    const now = startOfMonth(new Date());
    return Array.from({ length: 6 }, (_, i) => {
      const d = subMonths(now, i);
      return {
        value: format(d, 'yyyy-MM'),
        label: format(d, 'MMM yyyy'),
      };
    });
  }, []);

  return (
    <div className="flex flex-col gap-1.5 flex-1 md:max-w-[200px]">
      <Label className="text-xs text-muted-foreground">Cohort Month</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
