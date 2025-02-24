import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { CRMCompany } from "@/types/NirmaanCRM/CRMCompany"
import { useFrappeGetDocList } from "frappe-react-sdk"
import { ChevronRight, Plus } from "lucide-react"
import { useNavigate } from "react-router-dom"

export const Projects = () => {

  const navigate = useNavigate()

  const {data: projectsData, isLoading: projectsDataLoading} = useFrappeGetDocList("CRM Projects", {
    fields: ["*"],
    limit: 1000,
  }, "CRM Projects")

  const {data : companiesList, isLoading: companiesListLoading} = useFrappeGetDocList<CRMCompany>("CRM Company", {
     fields: ["name", "company_name"],
     limit: 1000,
   }, "CRM Company")

  return (
    <div>
      <div className="flex flex-col gap-8 h-full relative">
            <Input type="text" className="focus:border-none rounded-lg" placeholder="Search Names, Company, Project, etc..." />
            <div className="flex flex-col gap-4 max-sm:text-sm text-muted-foreground">
             {projectsData?.length > 0 ? (
              projectsData?.map((project, index, arr)=> (
                <section key={index}>
                <div role="button" onClick={() => navigate(`project?id=${project?.name}`)} className="h-16 px-4 flex items-center justify-between">
                 <div className="flex flex-col">
                     <strong className="text-black dark:text-muted-foreground">{project?.project_name}</strong>
                     <span>{companiesList?.find(company => company.name === project?.project_company)?.company_name}</span>
                 </div>
                  <ChevronRight />
                </div>
                {index !== arr.length - 1 && <Separator />}
              </section>
             ))) : (
               <p className="text-muted-foreground text-center">Empty!</p>
             )}
            </div>
          </div>

          <div className="fixed bottom-24 right-6">
            <button
              onClick={() => navigate("/projects/new")}
              className={`p-3 bg-destructive text-white rounded-full shadow-lg flex items-center justify-center`}
            >
              <Plus size={24} />
            </button>
          </div>
    </div>
  )
}