import { useMemo } from 'react';
import { useFrappeGetDocList } from 'frappe-react-sdk';
import ReactSelect from 'react-select';
import { Label } from '@/components/ui/label';

interface SalesUser {
  name: string;
  full_name: string;
  email: string;
}

interface Props {
  value: string[];
  onChange: (next: string[]) => void;
}

export const SalesPersonSelector = ({ value, onChange }: Props) => {
  const { data, isLoading } = useFrappeGetDocList<SalesUser>(
    'CRM Users',
    {
      fields: ['name', 'full_name', 'email'],
      filters: [['nirmaan_role_name', 'in', ['Nirmaan Sales User Profile', 'Nirmaan Admin User Profile']]],
      orderBy: { field: 'full_name', order: 'asc' },
      limit: 0,
    },
    'cohort-team-users'
  );

  const options = useMemo(
    () => (data ?? []).map((u) => ({ value: u.name, label: u.full_name })),
    [data]
  );

  const selectedOptions = useMemo(
    () => options.filter((o) => value.includes(o.value)),
    [options, value]
  );

  return (
    <div className="flex flex-col gap-1.5 flex-1 md:max-w-[320px]">
      <Label className="text-xs text-muted-foreground">Salespersons</Label>
      <ReactSelect
        isMulti
        options={options}
        isLoading={isLoading}
        value={selectedOptions}
        onChange={(opts) => onChange((opts ?? []).map((o) => o.value))}
        closeMenuOnSelect={false}
        hideSelectedOptions={false}
        placeholder="All salespersons"
        className="text-sm"
        menuPlacement="auto"
        menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
        styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
      />
    </div>
  );
};
