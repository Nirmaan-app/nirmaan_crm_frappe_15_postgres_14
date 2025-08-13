// import { create } from 'zustand';


import { CRMCompany } from '@/types/NirmaanCRM/CRMCompany'; // Make sure this import exists
import { create } from 'zustand';

// Context types define what data each dialog can receive
type NewContactContext = { companyId?: string };
type NewBoqContext = { companyId?: string };
type NewTaskContext = { companyId?: string; contactId?: string; boqId?: string };
type EditCompanyContext = { companyData: CRMCompany | null }; // Allow null for initial state

// The state now just holds the isOpen flag and the context data
type DialogState = {
  newCompany: { isOpen: boolean };
  editCompany: { isOpen: boolean; context: EditCompanyContext };
  newContact: { isOpen: boolean; context: NewContactContext };
  newBoq: { isOpen: boolean; context: NewBoqContext };
  newTask: { isOpen: boolean; context: NewTaskContext };
};

// The actions are now explicit open/close functions
type DialogActions = {
  openNewCompanyDialog: () => void;
  closeNewCompanyDialog: () => void;

  openEditCompanyDialog: (context: EditCompanyContext) => void;
  closeEditCompanyDialog: () => void;

  openNewContactDialog: (context?: NewContactContext) => void;
  closeNewContactDialog: () => void;

  openNewBoqDialog: (context?: NewBoqContext) => void;
  closeNewBoqDialog: () => void;
  
  openNewTaskDialog: (context?: NewTaskContext) => void;
  closeNewTaskDialog: () => void;
};

const initialState: DialogState = {
  newCompany: { isOpen: false },
  editCompany: { isOpen: false, context: { companyData: null } },
  newContact: { isOpen: false, context: {} },
  newBoq: { isOpen: false, context: {} },
  newTask: { isOpen: false, context: {} },
};

export const useDialogStore = create<DialogState & DialogActions>((set) => ({
  ...initialState,

  // --- Company Dialogs ---
  openNewCompanyDialog: () => set({ newCompany: { isOpen: true } }),
  closeNewCompanyDialog: () => set({ newCompany: { isOpen: false } }),

  // *** THE MISSING IMPLEMENTATION IS HERE ***
  openEditCompanyDialog: (context) => set({ editCompany: { isOpen: true, context } }),
  closeEditCompanyDialog: () => set((state) => ({ editCompany: { ...state.editCompany, isOpen: false } })),
  // *****************************************

  // --- Contact Dialog ---
  openNewContactDialog: (context = {}) => 
    set({ newContact: { isOpen: true, context } }),
  closeNewContactDialog: () => 
    set((state) => ({ newContact: { ...state.newContact, isOpen: false } })),

  // --- BOQ Dialog ---
  openNewBoqDialog: (context = {}) => 
    set({ newBoq: { isOpen: true, context } }),
  closeNewBoqDialog: () => 
    set((state) => ({ newBoq: { ...state.newBoq, isOpen: false } })),

  // --- Task Dialog ---
  openNewTaskDialog: (context = {}) => 
    set({ newTask: { isOpen: true, context } }),
  closeNewTaskDialog: () => 
    set((state) => ({ newTask: { ...state.newTask, isOpen: false } })),
}));

// // Context types define what data each dialog can receive
// type NewContactContext = { companyId?: string };
// type NewBoqContext = { companyId?: string };
// type NewTaskContext = { companyId?: string; contactId?: string; boqId?: string };
// type EditCompanyContext = { companyData: CRMCompany }; // Context for editing

// // The state now just holds the isOpen flag and the context data
// type DialogState = {
//   newCompany: { isOpen: boolean };
//   editCompany:{ isOpen: boolean; context: EditCompanyContext };
//   newContact: { isOpen: boolean; context: NewContactContext };
//   newBoq: { isOpen: boolean; context: NewBoqContext };
//   newTask: { isOpen: boolean; context: NewTaskContext };
// };
// //Edit Contact 



// // The actions are now explicit open/close functions
// type DialogActions = {
//   openNewCompanyDialog: () => void;
//   closeNewCompanyDialog: () => void;

// openEditCompanyDialog: (context: EditCompanyContext) => void; // NEW o
//   closeEditCompanyDialog: () => void; // NEW close action

//   openNewContactDialog: (context?: NewContactContext) => void;
//   closeNewContactDialog: () => void;

//   openNewBoqDialog: (context?: NewBoqContext) => void;
//   closeNewBoqDialog: () => void;
  
//   openNewTaskDialog: (context?: NewTaskContext) => void;
//   closeNewTaskDialog: () => void;
// };

// const initialState: DialogState = {
//   newCompany: { isOpen: false },
//     editCompany: { isOpen: false, context: { companyData: null } },
//   newContact: { isOpen: false, context: {} },
//   newBoq: { isOpen: false, context: {} },
//   newTask: { isOpen: false, context: {} },
// };

// export const useDialogStore = create<DialogState & DialogActions>((set) => ({
//   ...initialState,

//   // --- Company Dialog ---
//   openNewCompanyDialog: () => set({ newCompany: { isOpen: true } }),
//   closeNewCompanyDialog: () => set({ newCompany: { isOpen: false } }),

//   // --- Contact Dialog ---
//   openNewContactDialog: (context = {}) => 
//     set({ newContact: { isOpen: true, context } }),
//   closeNewContactDialog: () => 
//     set((state) => ({ newContact: { ...state.newContact, isOpen: false } })),

//   // --- BOQ Dialog ---
//   openNewBoqDialog: (context = {}) => 
//     set({ newBoq: { isOpen: true, context } }),
//   closeNewBoqDialog: () => 
//     set((state) => ({ newBoq: { ...state.newBoq, isOpen: false } })),

//   // --- Task Dialog ---
//   openNewTaskDialog: (context = {}) => 
//     set({ newTask: { isOpen: true, context } }),
//   closeNewTaskDialog: () => 
//     set((state) => ({ newTask: { ...state.newTask, isOpen: false } })),
// }));