import { useStateSyncedWithParams } from "@/hooks/useSearchParamsManager";
import { Company } from "./Companies/Company";
import { Contact } from "./Contacts/Contact";

export const DesktopContactOrCompany = () => {

  const [id] = useStateSyncedWithParams<string>("id", "");

  const [tab] = useStateSyncedWithParams<string>("tab", "contact");

 if(tab === "contact" && id) {
  return <Contact />
 } else if(tab === "company" && id) {
  return <Company />
 }

  return (
    <div className="flex items-center justify-center h-full">
      <span className="text-muted-foreground border border-muted-foreground rounded-lg px-4 py-2 tracking-tight">
        SELECT A {tab === "contact" ? "CONTACT" : "COMPANY"} TO SHOW DETAILS
      </span>
    </div>
  )
}