import { useStateSyncedWithParams } from "@/hooks/useSearchParamsManager";
import { CRMCompany } from "@/types/NirmaanCRM/CRMCompany";
import { CRMPRojects } from "@/types/NirmaanCRM/CRMProjects";
import { useFrappeGetDocList } from "frappe-react-sdk";
import { Plus } from "lucide-react";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

export const DesktopMiniCompanyView = () => {

  const navigate = useNavigate();

  const [company, setCompany] = useStateSyncedWithParams<string>("company", "")

  const {data : companiesList, isLoading: companiesListLoading} = useFrappeGetDocList<CRMCompany>("CRM Company", {
      fields: ["name", "company_name"],
      limit: 1000,
    }, "CRM Company")

    const {data : projectsList, isLoading: projectsListLoading} = useFrappeGetDocList<CRMPRojects>("CRM Projects", {
      fields: ["*"],
      limit: 1000
  }, `CRM Projects`)

  const handleNavigate = useCallback((value : string)  => {
    if(company !== value) {
      setCompany(value, ["id"])
    }
  }, [setCompany, company]);

  return (
      <div className="flex flex-col gap-8 h-full relative px-4">
            <button onClick={() => navigate("/projects/new")} className="flex items-center justify-center border border-primary rounded-lg p-6 text-primary">
              <Plus className="w-4 h-4" />
              <span className="">New Project</span>
            </button>
            <section className="flex flex-col gap-4 max-sm:text-sm text-muted-foreground">
                     {companiesList?.map((comp) => (
                         <div
                         key={comp?.name}
                          role="button"
                          aria-label="Company"
                          onClick={() => handleNavigate(comp.name)} 
                         className={`flex items-center justify-between border cardBorder shadow rounded-lg p-6 w-full 
                          ${(company === comp?.name) ? "bg-[#E6E6FA]" : ""}
                        `}>
                              <strong className="text-black dark:text-muted-foreground">{comp.company_name}</strong>
                              <span>{projectsList?.filter(project => project?.project_company === comp?.name)?.length}</span>
                         </div>
                      ))}
            </section>
    </div>
  )
}