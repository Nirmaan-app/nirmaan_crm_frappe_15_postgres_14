import { Separator } from "@/components/ui/separator"
import { CRMCompany } from "@/types/NirmaanCRM/CRMCompany"
import { useFrappeGetDocList } from "frappe-react-sdk"
import { ChevronRight } from "lucide-react"
import { useNavigate } from "react-router-dom"

export const Companies = () => {

  const navigate = useNavigate()

  const {data : companiesList, isLoading: companiesListLoading} = useFrappeGetDocList<CRMCompany>("CRM Company", {
    fields: ["name", "company_name"],
    limit: 1000,
  }, "CRM Company")

  return (
      <div className="flex flex-col gap-4 max-sm:text-sm text-muted-foreground">
             {companiesList?.map((company, index, arr) => (
               <section key={index}>
                 <div onClick={() => navigate(`company?id=${company.name}`)} className="h-16 px-4 flex items-center justify-between">
                      <strong className="text-black dark:text-muted-foreground">{company.company_name}</strong>
                      <ChevronRight />
                 </div>
                 {index !== arr.length - 1 && <Separator />}
               </section>
              ))}
      </div>
  )
}