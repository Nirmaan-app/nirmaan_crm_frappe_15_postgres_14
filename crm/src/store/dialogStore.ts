// import { create } from 'zustand';


import { CRMCompany } from '@/types/NirmaanCRM/CRMCompany'; // Make sure this 
// import exists
import { CRMContacts } from '@/types/NirmaanCRM/CRMContacts';
import { CRMPBOQ } from '@/types/NirmaanCRM/CRMBOQ';
import {CRMTask} from '@/types/NirmaanCRM/CRMTask';
import { create } from 'zustand';

// Context types define what data each dialog can receive
type NewContactContext = { companyId?: string };
type NewBoqContext = { companyId?: string };
type NewTaskContext = { companyId?: string; contactId?: string; boqId?: string };
//EDIT Type
type EditCompanyContext = { companyData: CRMCompany | null }; 
type EditContactContext = { contactData: CRMContacts | null };
type EditBoqContext = { 
  boqData: CRMPBOQ | null;
  mode: 'details' | 'status'| 'attachment'|"assigned-esitmate"; 

};
type EditTaskContext = { 
  taskData: CRMTask | null;
  mode: 'edit' | 'updateStatus' | 'scheduleNext';
};

type DateRangeContext = { onConfirm: (dateRange: { from: Date; to: Date }) => void };
type StatsDetailContext = { title: string; items: any[] };

//AssignBoqContext
type AssignBoqContext = { boqData: CRMBoq | null };

// NEW: Dedicated context for Remark BOQ
type RemarkBoqContext = { boqData: CRMBoq | null }; 

// The state now just holds the isOpen flag and the context data
type DialogState = {
  newCompany: { isOpen: boolean };
  newContact: { isOpen: boolean; context: NewContactContext };
  newBoq: { isOpen: boolean; context: NewBoqContext };
  newTask: { isOpen: boolean; context: NewTaskContext };

   editCompany: { isOpen: boolean; context: EditCompanyContext };
   editContact: { isOpen: boolean; context: EditContactContext };

   editBoq: { isOpen: boolean; context: EditBoqContext };
   // NEW: Dedicated Assign BOQ dialog state
   assignBoq: { isOpen: boolean; context: AssignBoqContext }; 
    // NEW: Dedicated Remark BOQ dialog state
   remarkBoq: { isOpen: boolean; context: RemarkBoqContext };

   editTask: { isOpen: boolean; context: EditTaskContext };

   dateRangePicker: { isOpen: boolean; context: DateRangeContext };
  statsDetail: { isOpen: boolean; context: StatsDetailContext };
  userProfile: { isOpen: boolean }; // <-- ADD THIS

  newUser: { isOpen: boolean };
};

// The actions are now explicit open/close functions
type DialogActions = {
  openNewCompanyDialog: () => void;
  closeNewCompanyDialog: () => void;

  openNewContactDialog: (context?: NewContactContext) => void;
  closeNewContactDialog: () => void;

  openNewBoqDialog: (context?: NewBoqContext) => void;
  closeNewBoqDialog: () => void;

    openEditBoqDialog: (context: EditBoqContext) => void;
  closeEditBoqDialog: () => void;

//Assign BOQ
  openAssignBoqDialog: (context: AssignBoqContext) => void;  
  closeAssignBoqDialog: () => void; 
  
  //Remark BOQ
 openRemarkBoqDialog: (context: RemarkBoqContext) => void; 
  closeRemarkBoqDialog: () => void; 

  openNewTaskDialog: (context?: NewTaskContext) => void;
  closeNewTaskDialog: () => void;


  openEditCompanyDialog: (context: EditCompanyContext) => void;
  closeEditCompanyDialog: () => void;
   openEditContactDialog: (context: EditContactContext) => void;
  closeEditContactDialog: () => void;
 
  openEditTaskDialog: (context: EditTaskContext) => void;
  closeEditTaskDialog: () => void;

   openDateRangePickerDialog: (context: DateRangeContext) => void;
  closeDateRangePickerDialog: () => void;
  openStatsDetailDialog: (context: StatsDetailContext) => void;
  closeStatsDetailDialog: () => void;
  
  openUserProfileDialog: () => void; // <-- ADD THIS
  closeUserProfileDialog: () => void; // <-- ADD THIS

  openNewUserDialog: () => void;
closeNewUserDialog: () => void;
};

const initialState: DialogState = {
  newCompany: { isOpen: false },
  newContact: { isOpen: false, context: {} },
  newBoq: { isOpen: false, context: {} },
  newTask: { isOpen: false, context: {} },

  editCompany: { isOpen: false, context: { companyData: null } },
  editContact: { isOpen: false, context: { contactData: null } },
  editBoq: { isOpen: false, context: { boqData: null, mode: 'details' } },
// NEW: Initial state for Assign BOQ dialog
  assignBoq: { isOpen: false, context: { boqData: null } }, 
  // NEW: Initial state for Remark BOQ dialog
  remarkBoq: { isOpen: false, context: { boqData: null } }, 

  editTask: { isOpen: false, context: { taskData: null, mode: 'edit' } },

   dateRangePicker: { isOpen: false, context: { onConfirm: () => {} } },
  statsDetail: { isOpen: false, context: { title: '', items: [] } },

  userProfile: { isOpen: false }, // <-- ADD THIS

  newUser: { isOpen: false },

};

export const useDialogStore = create<DialogState & DialogActions>((set) => ({
  ...initialState,

  // --- Company Dialogs ---
  openNewCompanyDialog: () => set({ newCompany: { isOpen: true } }),
  closeNewCompanyDialog: () => set({ newCompany: { isOpen: false } }),

  // *** THE MISSING IMPLEMENTATION IS HERE ***
 
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

   openEditCompanyDialog: (context) => set({ editCompany: { isOpen: true, context } }),
  closeEditCompanyDialog: () => set((state) => ({ editCompany: { ...state.editCompany, isOpen: false } })),
  
  openEditContactDialog: (context) => set({ editContact: { isOpen: true, context } }),
  closeEditContactDialog: () => set((state) => ({ editContact: { ...state.editContact, isOpen: false } })),

   openEditBoqDialog: (context) => set({ editBoq: { isOpen: true, context } }),
  closeEditBoqDialog: () => set((state) => ({ editBoq: { ...state.editBoq, isOpen: false } })),

    // NEW: Implement actions for Assign BOQ dialog
  openAssignBoqDialog: (context) => set({ assignBoq: { isOpen: true, context } }),
  closeAssignBoqDialog: () => set((state) => ({ assignBoq: { ...state.assignBoq, isOpen: false } })),
  // NEW: Implement actions for Remark BOQ dialog
  openRemarkBoqDialog: (context) => set({ remarkBoq: { isOpen: true, context } }),
  closeRemarkBoqDialog: () => set((state) => ({ remarkBoq: { ...state.remarkBoq, isOpen: false } })),

  
  openEditTaskDialog: (context) => set({ editTask: { isOpen: true, context } }),
  closeEditTaskDialog: () => set((state) => ({ editTask: { ...state.editTask, isOpen: false } })),

  //Home Page Dialogs 
  openDateRangePickerDialog: (context) => set({ dateRangePicker: { isOpen: true, context } }),
  closeDateRangePickerDialog: () => set((state) => ({ dateRangePicker: { ...state.dateRangePicker, isOpen: false } })),
  openStatsDetailDialog: (context) => set({ statsDetail: { isOpen: true, context } }),
  closeStatsDetailDialog: () => set((state) => ({ statsDetail: { ...state.statsDetail, isOpen: false } })),

  // --- User Profile Dialog ---  // <-- ADD THIS SECTION
  openUserProfileDialog: () => set({ userProfile: { isOpen: true } }),
  closeUserProfileDialog: () => set({ userProfile: { isOpen: false } }),

  openNewUserDialog: () => set({ newUser: { isOpen: true } }),
closeNewUserDialog: () => set({ newUser: { isOpen: false } }),


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