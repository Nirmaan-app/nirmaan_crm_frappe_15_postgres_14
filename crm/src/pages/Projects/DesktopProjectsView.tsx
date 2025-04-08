import { useStateSyncedWithParams } from "@/hooks/useSearchParamsManager";
import { CRMContacts } from "@/types/NirmaanCRM/CRMContacts";
import { CRMPRojects } from "@/types/NirmaanCRM/CRMProjects";
import { useFrappeGetDocList } from "frappe-react-sdk";
import { CompanyProjects } from "../Prospects/Companies/CompanyDetails";
import { Project } from "./Project";

export const DesktopProjectsView = () => {

  const [company] = useStateSyncedWithParams<string>("company", "")

  const [id] = useStateSyncedWithParams<string>("id", "")

  const {data: projectsList, isLoading: projectsListLoading} = useFrappeGetDocList<CRMPRojects>("CRM Projects", {
      fields: ["*"],
      filters: [["project_company", "=", company]],
      limit: 1000
  }, company ? `CRM Projects ${company}` : null)

  const {data : contactsList, isLoading: contactsListLoading} = useFrappeGetDocList<CRMContacts>("CRM Contacts", {
    fields: ["*"],
    filters: [["company", "=", company]],
    limit: 1000
  }, company ? `CRM Contacts ${company}` : null)

  if(id) {
    return (
        <Project />
    )
  }

  if(company) {
    return (
      <div className="space-y-4">
        <h2 className="font-bold">Projects</h2>
        <CompanyProjects contactsData={contactsList} projectsData={projectsList} projectsTab />
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center h-full">
      <span className="text-muted-foreground border border-muted-foreground rounded-lg px-4 py-2 tracking-tight">
        SELECT A COMPANY TO SHOW ASSOCIATED PROJECTS
      </span>
    </div>
  )
}