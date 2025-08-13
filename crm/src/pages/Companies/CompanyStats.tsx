// src/pages/Companies/CompanyStats.tsx

import { Button } from "@/components/ui/button";

const stats = [
    { label: 'Hot Deals', value: '02' },
    { label: 'Deals Won', value: '03' },
    { label: 'Pending Deals', value: '03' },
    { label: 'Total meetings done', value: '25' },
    { label: 'Follow up meetings done', value: '10' },
    { label: 'BOQ Recieved', value: '15' },
    { label: 'BOQ Sent', value: '15' }, // Assuming this was the missing card
];

export const CompanyStats = () => {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Filter by:</p>
                <div className="flex items-center border rounded-md">
                    <Button variant="ghost" className="bg-slate-700 text-white rounded-r-none h-8">Last 30 days</Button>
                    <Button variant="ghost" className="text-muted-foreground rounded-l-none h-8">Custom range</Button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {stats.map(stat => (
                    <div key={stat.label} className="bg-destructive text-white p-3 rounded-lg text-center">
                        <p className="text-sm">{stat.label}</p>
                        <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};