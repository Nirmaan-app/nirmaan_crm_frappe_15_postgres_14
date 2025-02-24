export const getFilteredTasks = (tasks : any[], filterDate: string, contacts: any[], companies: any[]) => {

  const contactsMap = new Map<string, any>();

  contacts?.map((contact) => {
    contactsMap.set(contact.name, contact)
  })

  const companiesMap = new Map<string, any>();

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