import { Separator } from "@/components/ui/separator"
import { useStateSyncedWithParams } from "@/hooks/useSearchParamsManager"
import { useViewport } from "@/hooks/useViewPort"
import { CRMCompany } from "@/types/NirmaanCRM/CRMCompany"
import { useFrappeGetDocList } from "frappe-react-sdk"
import { ChevronRight } from "lucide-react"
import { useCallback } from "react"
import { useNavigate } from "react-router-dom"

export const Companies = () => {

  const navigate = useNavigate()
  const {isDesktop} = useViewport()

  const [id, setId] = useStateSyncedWithParams<string>("id",  "");

  const {data : companiesList, isLoading: companiesListLoading} = useFrappeGetDocList<CRMCompany>("CRM Company", {
    fields: ["name", "company_name"],
    limit: 1000,
  }, "CRM Company")

  const handleNavigate = useCallback((value: string)  => {
    if(!isDesktop) {
      navigate(`company?id=${value}`)
    } else if(id !== value) {
      setId(value, ["innerTab"])
    }
  }, [navigate, isDesktop, id, setId]);

  return (
      <div className="flex flex-col gap-4 max-sm:text-sm text-muted-foreground">
             {companiesList?.map((company, index, arr) => (
               <section key={index}>
                 <div
                  role="button"
                  aria-label="Company"
                  onClick={() => handleNavigate(company.name)} 
                 className={`flex items-center justify-between ${isDesktop ? "border cardBorder shadow rounded-lg p-6 w-full" : "h-16 px-4"} 
                  ${(isDesktop && id === company?.company_name) ? "bg-[#E6E6FA]" : ""}
                `}>
                      <strong className="text-black dark:text-muted-foreground">{company.company_name}</strong>
                      {!isDesktop && <ChevronRight />}
                 </div>
                 {index !== arr.length - 1 && !isDesktop && <Separator />}
               </section>
              ))}
      </div>
  )
}