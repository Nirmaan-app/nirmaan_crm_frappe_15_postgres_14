// src/pages/BOQs/BOQs.tsx

import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { CRMCompany } from "@/types/NirmaanCRM/CRMCompany";
import { CRMBOQ } from "@/types/NirmaanCRM/CRMBOQ"; // 1. Use new type
import { useFrappeGetDocList } from "frappe-react-sdk";
import { ChevronRight, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

// 2. Rename the component
export const BOQs = () => {
  const navigate = useNavigate();

  // 3. Fetch from "CRM BOQ" Doctype
  const { data: boqsData, isLoading: boqsDataLoading } = useFrappeGetDocList<CRMBOQ>("CRM BOQ", {
    fields: ["name", "boq_name", "boq_company"], // Use fields from your BOQ doctype
    limit: 1000,
  }, "CRM BOQ");

  // This fetch for company context remains the same
  const { data: companiesList, isLoading: companiesListLoading } = useFrappeGetDocList<CRMCompany>("CRM Company", {
    fields: ["name", "company_name"],
    limit: 1000,
  }, "CRM Company");

  return (
    <div>
      <div className="flex flex-col gap-8 h-full relative">
        {/* 4. Update placeholder text */}
        <Input type="text" className="focus:border-none rounded-lg" placeholder="Search BOQ Name, Company, etc..." />
        <div className="flex flex-col gap-4 max-sm:text-sm text-muted-foreground">
          {boqsData?.length > 0 ? (
            // 5. Update variable name in map function
            boqsData.map((boq, index, arr) => (
              <section key={boq.name}>
                {/* 6. Navigate to the correct boq detail route */}
                <div role="button" onClick={() => navigate(`/boqs/boq?id=${boq.name}`)} className="h-16 px-4 flex items-center justify-between">
                  <div className="flex flex-col">
                    {/* 7. Use new fields from the CRMBOQ type */}
                    <strong className="text-black dark:text-muted-foreground">{boq.boq_name}</strong>
                    <span>{companiesList?.find(company => company.name === boq.boq_company)?.company_name}</span>
                  </div>
                  <ChevronRight />
                </div>
                {index !== arr.length - 1 && <Separator />}
              </section>
            ))
          ) : (
            <p className="text-muted-foreground text-center">No BOQs found.</p>
          )}
        </div>
      </div>

      <div className="fixed bottom-24 right-6">
        <button
          // 8. Navigate to the new BOQ form route
          onClick={() => navigate("/boqs/new")}
          className={`p-3 bg-destructive text-white rounded-full shadow-lg flex items-center justify-center`}
        >
          <Plus size={24} />
        </button>
      </div>
    </div>
  );
};