// src/pages/Companies/CompanyProgressCard.tsx

import React from 'react';
import { Button } from '@/components/ui/button';
import { useDialogStore, CRMCompany, CRMCompanyProgress } from '@/store/dialogStore';

import { Loader2, TrendingUp } from 'lucide-react'; // Example icons for loading and update

interface CompanyProgressCardProps {
    company: CRMCompany; // The company for which to show/update progress
}

export const CompanyProgressCard = ({ company }: CompanyProgressCardProps) => {
    const { openCompanyProgressDialog } = useDialogStore();

    // Fetch the latest Company Progress document for this specific company

    const handleUpdateProgressClick = () => {
        if (company) {
            openCompanyProgressDialog({
                companyId: company.name, // Pass the CRMCompany's ID
                progressData: company, // Pass the fetched progress data (CRMCompanyProgress type)
            });
        }
    };

    return (
       <div className="bg-background p-4 rounded-lg border shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
    {/* Left side: Current Progress Details */}
    <div className="flex flex-col gap-1">
        <p className="text-base  text-muted-foreground">Company Progress</p>
        
        <p className="text-base font-semibold flex items-center gap-2">
            Priority:
            <span className="text-primary-foreground text-xs bg-blue-500 px-2 py-1 rounded-md text-sm">
                {company.priority || 'N/A'}
            </span>
        </p>
        <p className="text-sm text-muted-foreground">
            Expected BOQs: <span className="font-medium">{company.expected_boq_count ?? 'N/A'}</span>
        </p>
    </div>

    {/* Right side: Update Button - Now wrapped for mobile alignment */}
    <div className="w-full flex justify-end sm:w-auto sm:block">
        <Button
            variant="outline"
            size="sm"
            className="border-primary text-primary hover:bg-primary/10 transition-colors"
            onClick={handleUpdateProgressClick}
            disabled={!company} // Disable button while loading progress data
        >
            <TrendingUp className="w-4 h-4 mr-2" />
            {company?.expected_boq_count ? "Update Progress" : "Add Progress"}
        </Button>
    </div>
</div>
    );
};