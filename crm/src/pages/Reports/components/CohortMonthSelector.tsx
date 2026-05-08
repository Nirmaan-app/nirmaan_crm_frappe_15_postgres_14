import { useMemo } from 'react';
import { format, subMonths, startOfMonth } from 'date-fns';
import ReactSelect, { components, type OptionProps, type ActionMeta } from 'react-select';
import { Label } from '@/components/ui/label';
import { fillRange, trimToContiguous } from '../utils/cohortRange';

interface MonthOption {
  value: string;
  label: string;
}

interface Props {
  value: string[];
  onChange: (next: string[]) => void;
  label?: string;
}

const CheckboxOption = (props: OptionProps<MonthOption, true>) => (
  <components.Option {...props}>
    <input
      type="checkbox"
      checked={props.isSelected}
      readOnly
      className="mr-2 align-middle"
    />
    <span className="align-middle">{props.label}</span>
  </components.Option>
);

export const CohortMonthSelector = ({ value, onChange, label = 'Cohort Months' }: Props) => {
  const options = useMemo<MonthOption[]>(() => {
    const now = startOfMonth(new Date());
    return Array.from({ length: 12 }, (_, i) => {
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

  const handleChange = (
    _opts: readonly MonthOption[] | null,
    action: ActionMeta<MonthOption>
  ) => {
    if (action.action === 'select-option' && action.option) {
      onChange(fillRange([...value, action.option.value]));
      return;
    }
    if (action.action === 'deselect-option' && action.option) {
      onChange(trimToContiguous(value, action.option.value));
      return;
    }
    if (
      (action.action === 'remove-value' || action.action === 'pop-value') &&
      action.removedValue
    ) {
      onChange(trimToContiguous(value, action.removedValue.value));
      return;
    }
    if (action.action === 'clear') {
      onChange([]);
    }
  };

  return (
    <div className="flex flex-col gap-1.5 flex-1 md:max-w-[280px]">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <ReactSelect<MonthOption, true>
        isMulti
        options={options}
        value={selectedOptions}
        onChange={handleChange}
        components={{ Option: CheckboxOption }}
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
