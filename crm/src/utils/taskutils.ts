import { CRMCompany } from "@/types/NirmaanCRM/CRMCompany";
import { CRMContacts } from "@/types/NirmaanCRM/CRMContacts";
import { CRMTask } from "@/types/NirmaanCRM/CRMTask";

export const getFilteredTasks = (tasks : CRMTask[] | undefined, filterDate: string, contacts: CRMContacts[] | undefined, companies: CRMCompany[] | undefined) => {

  const contactsMap = new Map<string | undefined, any>();

  contacts?.map((contact) => {
    contactsMap.set(contact.name, contact)
  })

  const companiesMap = new Map<string | undefined, any>();

  companies?.map((company) => {
    companiesMap.set(company.name, company)
  })

  let filteredResults = tasks
    ?.filter((task) => task?.start_date?.startsWith(filterDate))
    ?.sort((a, b) => a?.start_date?.localeCompare(b?.start_date))
    ?.map((t) => ({...t, contact: contactsMap.get(t.reference_docname)}))
    ?.map((k) => ({...k, company: companiesMap.get(k.contact?.company)}))

  return filteredResults

}