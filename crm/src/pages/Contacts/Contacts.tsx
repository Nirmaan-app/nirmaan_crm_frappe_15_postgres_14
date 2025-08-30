// // src/pages/Contacts/Contacts.tsx
// import { useViewport } from "@/hooks/useViewPort";
// import { ContactList } from "./ContactList";
// import { Contact } from "./Contact";
// import { useStateSyncedWithParams } from "@/hooks/useSearchParamsManager";
// import { useDialogStore } from "@/store/dialogStore";
// import { Plus } from "lucide-react";

// const DesktopPlaceholder = () => (
//   <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-secondary">
//     <span className="text-muted-foreground">Please select a Contact from the list</span>
//   </div>
// );

// export const Contacts = () => {
//   const { isMobile } = useViewport();
//   const [id, setId] = useStateSyncedWithParams<string>("id", "");
//   const { openNewContactDialog } = useDialogStore();

//   if (isMobile) {
//     return <ContactList />;
//   }

//   return (
//     <div className="grid grid-cols-[350px,1fr] gap-6 h-[calc(100vh-var(--navbar-height)-80px)]">
//       {/* Master Panel (Left) */}
//       <div className="bg-background rounded-lg border p-4 grid grid-rows-[auto,1fr,auto] gap-4">
//         <h2 className="text-lg font-semibold">Contacts</h2>
//         <div className="overflow-y-auto min-h-0">
//         <ContactList
//           onContactSelect={setId}
//           activeContactId={id}
//         />
//         </div>
//         <div>
//           <button
//             onClick={openNewContactDialog}
//             className="w-full h-12 bg-destructive text-white rounded-lg flex items-center justify-center gap-2"
//           >
//             <Plus size={20} /> Add New Contact
//           </button>
//         </div>
//       </div>

//       {/* Detail Panel (Right) */}
//       <div className="overflow-y-auto">
//         {id ? <Contact /> : <DesktopPlaceholder />}
//       </div>
//     </div>
//   );
// };


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
      {/* Master Panel (Left) - Fixed height with internal scrolling */}
      <div className="bg-background rounded-lg border flex flex-col min-h-0">
        {/* Header - Fixed at top */}
        <div className="p-4 border-b flex-shrink-0">
          <h2 className="text-lg font-semibold">Contacts</h2>
        </div>
        
        {/* Scrollable Contact List - Takes remaining space */}
        <div className="flex-1 overflow-y-auto min-h-0 p-4">
          <ContactList
            onContactSelect={setId}
            activeContactId={id}
          />
        </div>
        
        {/* Footer Button - Fixed at bottom */}
        <div className="p-4 border-t flex-shrink-0">
          <button
            onClick={openNewContactDialog}
            className="w-full h-12 bg-destructive text-white rounded-lg flex items-center justify-center gap-2"
          >
            <Plus size={20} /> Add New Contact
          </button>
        </div>
      </div>

      {/* Detail Panel (Right) - Independently scrollable */}
      <div className="bg-background rounded-lg border min-h-0">
        <div className="h-full overflow-y-auto p-4">
          {id ? <Contact /> : <DesktopPlaceholder />}
        </div>
      </div>
    </div>
  );
};