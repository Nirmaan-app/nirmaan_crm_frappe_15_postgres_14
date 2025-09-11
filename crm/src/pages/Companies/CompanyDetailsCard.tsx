// src/pages/Companies/CompanyDetailsCard.tsx

import { Button } from "@/components/ui/button";
import { CRMCompany } from "@/types/NirmaanCRM/CRMCompany";
import { SquarePen } from "lucide-react";
import { useDialogStore } from "@/store/dialogStore"; 
import { formatDate, formatTime12Hour,formatDateWithOrdinal } from "@/utils/FormatDate";
import {useUserRoleLists} from "@/hooks/useUserRoleLists"


interface CompanyDetailsCardProps {
    company: CRMCompany;
    totalProjects: number;
    totalContacts: number;
    activeProjects:number
}

export const CompanyDetailsCard = ({ company, totalProjects, totalContacts,activeProjects }: CompanyDetailsCardProps) => {
  const { openEditCompanyDialog,openRenameCompanyNameDialog } = useDialogStore();
   if (!company) {
        return null; // Or a loading skeleton
    }
      const { getUserFullNameByEmail, isLoading: usersLoading } = useUserRoleLists();


      // --- NEW: Handler for opening the rename dialog ---
          const handleRenameCompanyClick = () => {
              // Ensure boq.name is available before opening
              if (company?.name) {
                  openRenameCompanyNameDialog({
                      currentDoctype: "CRM Company", // Specify your doctype
                      currentDocName: company.name,
                  });
              } else {
                  toast({ title: "Error", description: "BOQ document name is missing.", variant: "destructive" });
              }
          };
      

    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold">Company Details</h2>
                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => openEditCompanyDialog({ companyData: company })}>
                    <SquarePen className="w-4 h-4 mr-2" />
                    EDIT
                </Button>
            </div>

            <div className="bg-background p-4 rounded-lg border shadow-sm">
                <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                    <div>
                        {/* <p className="text-xs text-muted-foreground">Company Name</p> */}
                        <div className="flex items-center gap-2">
                                                                    <p className="text-sm text-muted-foreground">BOQ Company</p>
                        
                                                <Button
                                                    variant="ghost" // Use a ghost variant for a subtle, icon-only button
                                                    size="icon"     // Make it a small, icon-only button
                                                    className="h-7 w-7 text-muted-foreground hover:text-primary" // Adjust size/color
                                                    onClick={handleRenameCompanyClick}
                                                    aria-label="Rename BOQ" // Accessibility
                                                >
                                                    <SquarePen className="w-4 h-4" /> {/* Pencil icon */}
                                                </Button>
                                            </div>
                        <p className="font-semibold">{company?.company_name}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-muted-foreground">City</p>
                        <p className="font-semibold">{company?.company_city || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Company Type</p>
                        <p className="font-semibold">{company?.company_type || 'N/A'}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-muted-foreground">Last Meeting Date</p>
                        <p className="font-bold text-sm">{formatDateWithOrdinal(company.last_meeting)}</p> {/* This is static for now */}
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Total Projects</p>
                        <p className="font-bold text-lg">{String(totalProjects).padStart(2, '0')}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-muted-foreground">Active Projects</p>
                        <p className="font-bold text-lg">{activeProjects}</p> {/* This is static for now */}
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Total Contacts</p>
                        <p className="font-bold text-lg">{String(totalContacts).padStart(2, '0')}</p>
                    </div>
                           <div className="text-right">
                        <p className="text-xs text-muted-foreground">Assigned Sales</p>
                        <p className="font-bold text-sm">{getUserFullNameByEmail(company?.assigned_sales) ||"N/A"}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};