// src/pages/Companies/Companies.tsx
import { useViewport } from "@/hooks/useViewPort";
import { CompanyList } from "./CompanyList";
import { Company } from "./Company";
import { useStateSyncedWithParams } from "@/hooks/useSearchParamsManager";
import { useDialogStore } from "@/store/dialogStore";
import { Plus } from "lucide-react";

const DesktopPlaceholder = () => (
  <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-secondary">
    <span className="text-muted-foreground">Please select a Company from the list</span>
  </div>
);

export const Companies = () => {
  const { isMobile } = useViewport();
  const [id, setId] = useStateSyncedWithParams<string>("id", "");
  const { openNewCompanyDialog } = useDialogStore();

  // If we are on a mobile device, we only show the list.
  // Navigation to the detail page is handled inside CompanyList.
  if (isMobile) {
    return <CompanyList />;
  }

  // On desktop, we render the master-detail layout.
  return (
    <div className="grid grid-cols-[350px,1fr] gap-6 h-[calc(100vh-var(--navbar-height)-80px)]">
      {/* Master Panel (Left) */}
      <div className="bg-background rounded-lg border p-4 flex flex-col">
        <h2 className="text-lg font-semibold mb-4">Companies</h2>
        <CompanyList
          onCompanySelect={setId}
          activeCompanyId={id}
        />
        <div className="mt-4">
          <button
            onClick={openNewCompanyDialog}
            className="w-full h-12 bg-destructive text-white rounded-lg flex items-center justify-center gap-2"
          >
            <Plus size={20} /> Add New Company
          </button>
        </div>
      </div>

      {/* Detail Panel (Right) */}
      <div className="overflow-y-auto">
        {id ? <Company /> : <DesktopPlaceholder />}
      </div>
    </div>
  );
};