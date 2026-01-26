import { Button } from '@/components/ui/button';
import { useDialogStore } from '@/store/dialogStore';
import { CRMBOQ } from '@/types/NirmaanCRM/CRMBOQ';
import { SquarePen } from 'lucide-react';

interface BoqBcsStatusCardProps {
    boq: CRMBOQ;
}

const getBcsStatusClass = (status?: string) => {
    switch (status) {
        case 'Pending': return 'bg-yellow-100 text-yellow-800';
        case 'Review Pending': return 'bg-blue-100 text-blue-800';
        case 'Completed': return 'bg-green-100 text-green-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

export const BoqBcsStatusCard = ({ boq }: BoqBcsStatusCardProps) => {
    const { openEditBcsStatusDialog } = useDialogStore();

    const role = localStorage.getItem('role');
    const canEdit = role === 'Nirmaan Admin User Profile' || role === 'Nirmaan Estimations User Profile';

    const handleUpdateBcsStatusClick = () => {
        if (boq) {
            openEditBcsStatusDialog({ boqData: boq });
        }
    };

    return (
        <div className="bg-background p-4 rounded-lg border shadow-sm flex justify-between items-center">
            <div>
                <p className="text-sm text-muted-foreground mb-2">BCS Status : <span className={`font-semibold text-xs px-3 py-1 rounded-full ${getBcsStatusClass(boq.bcs_status)}`}>
                    {boq.bcs_status||"N/A"}
                </span></p>
            </div>
            {canEdit && (
                <Button variant="outline" size="sm" className="border-destructive text-destructive" onClick={handleUpdateBcsStatusClick}>
                    <SquarePen className="w-4 h-4 mr-2" />Update
                </Button>
            )}
        </div>
    );
};
