import { Separator } from "@/components/ui/separator"
import { CRMCompany } from "@/types/NirmaanCRM/CRMCompany"
import { CRMContacts } from "@/types/NirmaanCRM/CRMContacts"
import { useFrappeGetDocList } from "frappe-react-sdk"
import { ChevronRight } from "lucide-react"
import { useNavigate } from "react-router-dom"

export const Contacts = () => {

  const navigate = useNavigate()

  const {data : contactsList, isLoading: contactsListLoading} = useFrappeGetDocList<CRMContacts>("CRM Contacts", {
    fields: ["*"],
    limit: 10000
  }, "CRM Contacts")

  const {data : companiesList, isLoading: companiesListLoading} = useFrappeGetDocList<CRMCompany>("CRM Company", {
    fields: ["name", "company_name"],
    limit: 1000,
  }, "CRM Company")

  return (
      <div className="flex flex-col gap-4 max-sm:text-sm text-muted-foreground">
             {contactsList?.map((contact, index, arr)=> (
                <section key={index}>
                <div onClick={() => navigate(`contact?id=${contact.name}`)} className="h-16 px-4 flex items-center justify-between">
                 <div className="flex flex-col">
                     <strong className="text-black dark:text-muted-foreground">{contact.first_name} {contact.last_name}</strong>
                     <span>{companiesList?.find(company => company.name === contact.company)?.company_name}</span>
                 </div>
                  <ChevronRight />
                </div>
                {index !== arr.length - 1 && <Separator />}
              </section>
             ))}
      </div>
  )
}