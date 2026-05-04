import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface Props {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
}

export const CohortEmptyState = ({ title, subtitle, icon }: Props) => {
  return (
    <Card className="p-8 md:p-12 flex flex-col items-center justify-center text-center">
      <div className="p-3 rounded-full bg-muted/50 text-muted-foreground mb-4">
        {icon ?? <Inbox className="w-6 h-6" />}
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      {subtitle && (
        <p className="text-sm text-muted-foreground mt-1.5 max-w-sm">{subtitle}</p>
      )}
    </Card>
  );
};
