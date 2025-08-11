// src/pages/BOQs/DesktopBOQsView.tsx

import { useStateSyncedWithParams } from "@/hooks/useSearchParamsManager";
import { CRMContacts } from "@/types/NirmaanCRM/CRMContacts";
import { CRMBOQ } from "@/types/NirmaanCRM/CRMBOQ"; // 1. Use new type
import { useFrappeGetDocList } from "frappe-react-sdk";
// We need to refactor CompanyProjects to CompanyBOQs. It might be better to define it locally.
import { CompanyDetails } from "../Companies/CompanyDetails"; // 2. This component will also need refactoring
import { BOQ } from "./BOQ"; // 3. Use new BOQ detail component

// 4. Rename the component
export const DesktopBOQsView = () => {

  const [company] = useStateSyncedWithParams<string>("company", "");
  const [id] = useStateSyncedWithParams<string>("id", "");

  // 5. Fetch "CRM BOQ" instead of "CRM Projects"
  const { data: boqsList, isLoading: boqsListLoading } = useFrappeGetDocList<CRMBOQ>("CRM BOQ", {
      fields: ["*"],
      // 6. Filter by the correct field name from your BOQ doctype
      filters: [["boq_company", "=", company]], 
      limit: 1000,
  }, company ? `CRM BOQ ${company}` : null); // Update SWR key for caching

  // This fetch remains the same as it's needed for context
  const { data: contactsList, isLoading: contactsListLoading } = useFrappeGetDocList<CRMContacts>("CRM Contacts", {
    fields: ["*"],
    filters: [["company", "=", company]],
    limit: 1000,
  }, company ? `CRM Contacts ${company}` : null);

  // If an 'id' is present in the URL, show the detail view for a single BOQ
  if (id) {
    return (
        <BOQ /> // Use the renamed BOQ detail component
    );
  }

  // If a 'company' is present, show the list of associated BOQs
  if (company) {
    return (
      <div className="space-y-4">
        <h2 className="font-bold">BOQs</h2> {/* 7. Update heading */}
        {/* 
          Pass boqsList to the newly named prop `boqsData`.
          The `CompanyBOQs` component itself will need to be refactored.
        */}
        <CompanyDetails contactsData={contactsList} boqsData={boqsList} boqsTab />
      </div>
    );
  }

  // Default state when no company is selected
  return (
    <div className="flex items-center justify-center h-full">
      <span className="text-muted-foreground border border-muted-foreground rounded-lg px-4 py-2 tracking-tight">
        {/* 8. Update placeholder text */}
        SELECT A COMPANY TO SHOW ASSOCIATED BOQS
      </span>
    </div>
  );
};