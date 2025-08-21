// src/pages/MyTeam/OverviewTab.tsx

import { Button } from "@/components/ui/button";
import { PerformanceChart } from "./PerformanceChart";

export const OverviewTab = ({ member, performanceData }) => {
    return (
        <div className="space-y-6">
            <div className="bg-background p-6 rounded-lg border shadow-sm">
                <div className="grid grid-cols-2 gap-y-6 items-center">
                    <div>
                        <p className="text-sm text-muted-foreground">User Name</p>
                        <p className="text-xl font-bold text-destructive">{member?.full_name}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-muted-foreground">Designation</p>
                        <p className="text-lg font-semibold text-destructive">{member?.nirmaan_role_name || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-semibold">{member?.name}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-muted-foreground">Phone Number</p>
                        <p className="font-semibold">{member?.mobile_no || 'N/A'}</p>
                    </div>
                </div>
                <div className="flex justify-end gap-2 mt-6 border-t pt-4">
                    <Button variant="outline">Edit</Button>
                    <Button variant="destructive">Delete</Button>
                </div>
            </div>

            <div className="bg-background p-4 rounded-lg border shadow-sm">
                <h3 className="font-semibold text-lg mb-4">Performance Overview</h3>
                <PerformanceChart data={performanceData} />
            </div>
        </div>
    );
};