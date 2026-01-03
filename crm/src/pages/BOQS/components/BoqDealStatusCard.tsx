// src/pages/BOQs/BoqDealStatusCard.tsx

import React from 'react';
import { Button } from '@/components/ui/button';
import { useDialogStore } from '@/store/dialogStore';
import { CRMBOQ } from '@/types/NirmaanCRM/CRMBOQ';
import { SquarePen } from 'lucide-react'; // Assuming SquarePen is used for edit icon

interface BoqDealStatusCardProps {
    boq: CRMBOQ;
}

// Helper to get a status class for deal status (if you want colored pills)
const getDealStatusClass = (status?: string) => {
    switch (status) {
        case 'Hot':
            return 'bg-red-100 text-red-800';
        case 'Warm':
            return 'bg-yellow-100 text-yellow-800';
        case 'Cold':
            return 'bg-blue-100 text-blue-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

// Helper to get a status class for client status
const getClientStatusClass = (status?: string) => {
    switch (status) {
        case 'Converted':
            return 'bg-blue-100 text-blue-800';
        case 'Tender':
            return 'bg-blue-700 text-white';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

export const BoqDealStatusCard = ({ boq }: BoqDealStatusCardProps) => {
    const { openEditDealStatusDialog } = useDialogStore(); // Access the new dialog opener
    
    const handleUpdateDealStatusClick = () => {
        if (boq) {
            openEditDealStatusDialog({ boqData: boq });
        } else {
            // Optional: Handle case where boq data is missing
            console.error("BOQ data is missing for updating deal status.");
        }
    };

    console.log("boq",boq.deal_status)
    
    return (
        <div className="bg-background p-4 rounded-lg border shadow-sm flex justify-between items-center">
            {/* Left side: Deal Status */}
            <div>
                <p className="text-sm text-muted-foreground mb-2">Deal Status : <span className={`font-semibold text-xs px-3 py-1 rounded-full ${getDealStatusClass(boq.deal_status)}`}>
                    {boq.deal_status||"N/A"}
                </span></p>
                <p className="text-sm text-muted-foreground">Client Deal Status : <span className={`font-semibold text-xs px-3 py-1 rounded-full ${getClientStatusClass(boq.client_deal_status)}`}>
                    {boq.client_deal_status||"N/A"}
                </span></p>
            </div>

            {/* Right side: Update Button */}
            <Button
                variant="outline"
                size="sm"
                className="border-destructive text-destructive"
                onClick={handleUpdateDealStatusClick}
            >
                <SquarePen className="w-4 h-4 mr-2" />
                Update 
            </Button>
        </div>
    );
};