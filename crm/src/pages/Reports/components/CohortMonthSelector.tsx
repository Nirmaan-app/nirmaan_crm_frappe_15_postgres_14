import { useMemo } from 'react';
import { format, subMonths, startOfMonth } from 'date-fns';
import ReactSelect from 'react-select';
import { Label } from '@/components/ui/label';

interface Props {
  value: string[];
  onChange: (next: string[]) => void;
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

  const selectedOptions = useMemo(
    () => options.filter((o) => value.includes(o.value)),
    [options, value]
  );

  return (
    <div className="flex flex-col gap-1.5 flex-1 md:max-w-[280px]">
      <Label className="text-xs text-muted-foreground">Cohort Months</Label>
      <ReactSelect
        isMulti
        options={options}
        value={selectedOptions}
        onChange={(opts) => onChange((opts ?? []).map((o) => o.value))}
        closeMenuOnSelect={false}
        hideSelectedOptions={false}
        placeholder="Select month(s)…"
        className="text-sm"
        menuPlacement="auto"
        menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
        styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
      />
    </div>
  );
};
