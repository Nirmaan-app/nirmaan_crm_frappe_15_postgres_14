

// src/pages/Companies/Companies.tsx
import { useViewport } from "@/hooks/useViewPort";
import { CompanyList } from "./CompanyList";
import { Company } from "./Company";
import { useStateSyncedWithParams } from "@/hooks/useSearchParamsManager";
import { useDialogStore } from "@/store/dialogStore";
import { Plus } from "lucide-react";

const DesktopPlaceholder = () => (
  <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-secondary">
    <span className="text-muted-foreground">Please select a Company from the list</span>
  </div>
);

export const Companies = () => {
  const { isMobile } = useViewport();
  const [id, setId] = useStateSyncedWithParams<string>("id", "");
  const { openNewCompanyDialog } = useDialogStore();

  // If we are on a mobile device, we only show the list.
  // Navigation to the detail page is handled inside CompanyList.
  if (isMobile) {
    return <CompanyList />;
  }

  // On desktop, we render the master-detail layout.
  return (
    <div className="grid grid-cols-[350px,1fr] gap-6 h-[calc(100vh-var(--navbar-height)-80px)]">
      {/* Master Panel (Left) */}
      <div className="bg-background rounded-lg border p-4 flex flex-col">
        <h2 className="text-lg font-semibold mb-4">Companies</h2>
        <CompanyList
          onCompanySelect={setId}
          activeCompanyId={id}
        />
        <div className="mt-4">
          <button
            onClick={openNewCompanyDialog}
            className="w-full h-12 bg-destructive text-white rounded-lg flex items-center justify-center gap-2"
          >
            <Plus size={20} /> Add New Company
          </button>
        </div>
      </div>

      {/* Detail Panel (Right) */}
      <div className="overflow-y-auto">
        {id ? <Company /> : <DesktopPlaceholder />}
      </div>
    </div>
  );
};

// import { Separator } from "@/components/ui/separator"
// import { useStateSyncedWithParams } from "@/hooks/useSearchParamsManager"
// import { useViewport } from "@/hooks/useViewPort"
// import { CRMCompany } from "@/types/NirmaanCRM/CRMCompany"
// import { useFrappeGetDocList } from "frappe-react-sdk"
// import { ChevronRight } from "lucide-react"
// import { useCallback } from "react"
// import { useNavigate } from "react-router-dom"

// export const Companies = () => {

//   const navigate = useNavigate()
//   const {isDesktop} = useViewport()

//   const [id, setId] = useStateSyncedWithParams<string>("id",  "");

//   const {data : companiesList, isLoading: companiesListLoading} = useFrappeGetDocList<CRMCompany>("CRM Company", {
//     fields: ["name", "company_name"],
//     limit: 1000,
//   }, "CRM Company")

//   const handleNavigate = useCallback((value: string)  => {
//     if(!isDesktop) {
//       navigate(`company?id=${value}`)
//     } else if(id !== value) {
//       setId(value, ["innerTab"])
//     }
//   }, [navigate, isDesktop, id, setId]);

//   return (
//       <div className="flex flex-col gap-4 max-sm:text-sm text-muted-foreground">
//              {companiesList?.map((company, index, arr) => (
//                <section key={index}>
//                  <div
//                   role="button"
//                   aria-label="Company"
//                   onClick={() => handleNavigate(company.name)} 
//                  className={`flex items-center justify-between ${isDesktop ? "border cardBorder shadow rounded-lg p-6 w-full" : "h-16 px-4"} 
//                   ${(isDesktop && id === company?.company_name) ? "bg-[#E6E6FA]" : ""}
//                 `}>
//                       <strong className="text-black dark:text-muted-foreground">{company.company_name}</strong>
//                       {!isDesktop && <ChevronRight />}
//                  </div>
//                  {index !== arr.length - 1 && !isDesktop && <Separator />}
//                </section>
//               ))}
//       </div>
//   )
// }