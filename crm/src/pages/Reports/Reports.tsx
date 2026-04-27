import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { ArrowRight, BarChart3, Sparkles } from 'lucide-react';

export const Reports = () => {
  const navigate = useNavigate();

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">Reports</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Insights and analytics for sales pipeline performance
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card
          onClick={() => navigate('/reports/sales-cohort')}
          className="group cursor-pointer border-border/60 hover:border-destructive/40 hover:shadow-md transition-all"
        >
          <CardHeader className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-destructive/10 text-destructive">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <CardTitle className="text-lg">Sales Cohort Report</CardTitle>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-destructive group-hover:translate-x-0.5 transition-all" />
            </div>
            <CardDescription>
              Track how projects added in a given month progress through statuses over time.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-border/60 opacity-60 cursor-not-allowed">
          <CardHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-muted text-muted-foreground">
                <Sparkles className="w-5 h-5" />
              </div>
              <CardTitle className="text-lg">Placeholder Report</CardTitle>
            </div>
            <CardDescription>Coming soon.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
