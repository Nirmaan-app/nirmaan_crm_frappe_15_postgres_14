import { useFrappeGetDocList } from 'frappe-react-sdk';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface SalesUser {
  name: string;
  full_name: string;
  email: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export const SalesPersonSelector = ({ value, onChange }: Props) => {
  const { data, isLoading } = useFrappeGetDocList<SalesUser>(
    'CRM Users',
    {
      fields: ['name', 'full_name', 'email'],
      filters: [['nirmaan_role_name', '=', 'Nirmaan Sales User Profile']],
      orderBy: { field: 'full_name', order: 'asc' },
      limit: 0,
    },
    'cohort-sales-users'
  );

  return (
    <div className="flex flex-col gap-1.5 flex-1 md:max-w-[240px]">
      <Label className="text-xs text-muted-foreground">Salesperson</Label>
      <Select
        value={value || 'all'}
        onValueChange={(v) => onChange(v === 'all' ? '' : v)}
      >
        <SelectTrigger>
          <SelectValue placeholder={isLoading ? 'Loading...' : 'All'} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          {data?.map((user) => (
            <SelectItem key={user.name} value={user.name}>
              {user.full_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
