// src/pages/Contacts/Contacts.tsx
import { useViewport } from "@/hooks/useViewPort";
import { ContactList } from "./ContactList";
import { Contact } from "./Contact";
import { useStateSyncedWithParams } from "@/hooks/useSearchParamsManager";
import { useDialogStore } from "@/store/dialogStore";
import { Plus } from "lucide-react";

const DesktopPlaceholder = () => (
  <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-secondary">
    <span className="text-muted-foreground">Please select a Contact from the list</span>
  </div>
);

export const Contacts = () => {
  const { isMobile } = useViewport();
  const [id, setId] = useStateSyncedWithParams<string>("id", "");
  const { openNewContactDialog } = useDialogStore();

  if (isMobile) {
    return <ContactList />;
  }

  return (
    <div className="grid grid-cols-[350px,1fr] gap-6 h-[calc(100vh-var(--navbar-height)-80px)]">
      {/* Master Panel (Left) */}
      <div className="bg-background rounded-lg border p-4 flex flex-col">
        <h2 className="text-lg font-semibold mb-4">Contacts</h2>
        <ContactList
          onContactSelect={setId}
          activeContactId={id}
        />
        <div className="mt-4">
          <button
            onClick={openNewContactDialog}
            className="w-full h-12 bg-destructive text-white rounded-lg flex items-center justify-center gap-2"
          >
            <Plus size={20} /> Add New Contact
          </button>
        </div>
      </div>

      {/* Detail Panel (Right) */}
      <div className="overflow-y-auto">
        {id ? <Contact /> : <DesktopPlaceholder />}
      </div>
    </div>
  );
};


// import { Separator } from "@/components/ui/separator"
// import { useStateSyncedWithParams } from "@/hooks/useSearchParamsManager"
// import { useViewport } from "@/hooks/useViewPort"
// import { CRMCompany } from "@/types/NirmaanCRM/CRMCompany"
// import { CRMContacts } from "@/types/NirmaanCRM/CRMContacts"
// import { useFrappeGetDocList } from "frappe-react-sdk"
// import { ChevronRight } from "lucide-react"
// import { useCallback } from "react"
// import { useNavigate } from "react-router-dom"

// export const Contacts = () => {

//   const navigate = useNavigate()
//   const {isDesktop} = useViewport()

//   const [id, setId] = useStateSyncedWithParams<string>("id", "");

//   const {data : contactsList, isLoading: contactsListLoading} = useFrappeGetDocList<CRMContacts>("CRM Contacts", {
//     fields: ["*"],
//     limit: 10000
//   }, "CRM Contacts")

//   const {data : companiesList, isLoading: companiesListLoading} = useFrappeGetDocList<CRMCompany>("CRM Company", {
//     fields: ["name", "company_name"],
//     limit: 1000,
//   }, "CRM Company")

//   const handleNavigate = useCallback((value: string)  => {
//     if(!isDesktop) {
//       navigate(`contact?id=${value}`)
//     } else if(id !== value) {
//       setId(value, ["innerTab"])
//     }
//   }, [navigate, isDesktop, id, setId]);

//   return (
//       <div className="flex flex-col gap-4 max-sm:text-sm text-muted-foreground">
//              {contactsList?.map((contact, index, arr)=> (
//                 <section key={index}>
//                 <div
//                  role="button"
//                  aria-label="Contact"
//                  onClick={() => handleNavigate(contact?.name)} 
//                 className={`flex items-center justify-between ${isDesktop ? "border cardBorder shadow rounded-lg px-6 py-4 w-full" : "h-16 px-4"} 
//                   ${(isDesktop && id === contact?.name) ? "bg-[#E6E6FA]" : ""}
//                 `}>
//                  <div className={`flex flex-col`}>
//                      <strong className="text-black dark:text-muted-foreground">{contact.first_name} {contact.last_name}</strong>
//                      <span>{companiesList?.find(company => company.name === contact.company)?.company_name}</span>
//                  </div>
//                  {!isDesktop && <ChevronRight />}
//                 </div>
//                 {index !== arr.length - 1 && !isDesktop && <Separator />}
//               </section>
//              ))}
//       </div>
//   )
// }