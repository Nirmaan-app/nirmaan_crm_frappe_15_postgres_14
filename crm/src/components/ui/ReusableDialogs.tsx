// src/components/ui/ReusableFormDialog.tsx

// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
// } from '@/components/ui/dialog';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./dialog";
import React from 'react';
import { cn } from '@/lib/utils';

interface ReusableFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  // Optional prop to control width
  className?: string;
}

export const ReusableFormDialog = ({
  isOpen,
  onClose,
  title,
  children,
  className,
}: ReusableFormDialogProps) => {

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {/* 
        The DialogContent is where the magic happens.
        We'll use flexbox to structure it and give it the modern look.
      */}
      <DialogContent 
        className={cn(
            "p-0 gap-0 w-[90vw] max-w-md rounded-xl shadow-2xl", // Base styles
            "flex flex-col", // Use flexbox for layout
            "max-h-[90vh]", // Set a maximum height relative to the viewport
            className // Allow overriding styles
        )}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {/* 1. HEADER SECTION */}
        <DialogHeader className="p-6 pb-4 text-center">
          <DialogTitle className="text-destructive text-xl font-bold">
            {title}
          </DialogTitle>
        </DialogHeader>

        {/* 2. CONTENT/FORM SECTION */}
        {/*
          This div will be the scrollable area. `overflow-y-auto` is key.
          It will only show a scrollbar if the content inside (the form) is taller
          than the available space. This solves the dropdown issue.
        */}
        <div className="flex-1 overflow-x-auto overflow-y-auto px-6 pb-6">
          {/*
            We no longer use DialogDescription for the form.
            The children (your form component) are rendered directly.
          */}
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
};


import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";


export interface ReusableAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  children?: React.ReactNode;
  disableConfirm?: boolean;
  loading?: boolean;
}

export const ReusableAlertDialog: React.FC<ReusableAlertDialogProps> = ({
  open,
  onOpenChange,
  title,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  children,
  disableConfirm = false,
  loading = false,
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader className="text-start">
          <AlertDialogTitle className="text-destructive text-center">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div>{children}</div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex items-end gap-2">
          <AlertDialogCancel className="flex-1">
            {cancelText}
          </AlertDialogCancel>
          <Button disabled={disableConfirm} onClick={onConfirm} className="flex-1">
            {confirmText}
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};


// export interface ReusableDialogProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   title: string;
//   confirmText?: string;
//   cancelButton?: boolean;
//   cancelText?: string;
//   onConfirm: () => void;
//   children?: React.ReactNode;
//   disableConfirm?: boolean;
//   loading?: boolean;
//   cancelConfirm?: () => void;
// }

// export const ReusableDialog: React.FC<ReusableDialogProps> = ({
//   open,
//   onOpenChange,
//   title,
//   confirmText = "Confirm",
//   cancelText = "Cancel",
//   onConfirm,
//   children,
//   disableConfirm = false,
//   loading = false,
//   cancelButton = true,
//   cancelConfirm,
// }) => {
//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent>
//         <DialogHeader className="text-start">
//           <DialogTitle className="text-destructive text-center">
//             {title}
//           </DialogTitle>
//           <DialogDescription asChild>
//             <div>{children}</div>
//           </DialogDescription>
//         </DialogHeader>
//         <div className="flex items-end gap-2">
//           {cancelButton ? (
//             <DialogClose className="flex-1" asChild>
//               <Button variant={"outline"}>
//                 {cancelText}
//               </Button>
//             </DialogClose>
//           ) : (
//             <Button onClick={cancelConfirm} variant={"outline"} className="flex-1">
//               {cancelText}
//             </Button>
//           )}
//           <Button disabled={disableConfirm} onClick={onConfirm} className="flex-1">
//             {confirmText}
//           </Button>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// };



// // Define the props the component will accept
// interface ReusableFormDialogProps {
//   /**
//    * The boolean value from your Zustand store that controls visibility.
//    * e.g., `newCompany.isOpen`
//    */
//   isOpen: boolean;

//   /**
//    * The function from your Zustand store that closes the dialog.
//    * e.g., `closeNewCompanyDialog`
//    */
//   onClose: () => void;

//   /**
//    * The title to be displayed in the dialog's header.
//    */
//   title: string;

//   /**
//    * The actual form component that will be rendered inside the dialog.
//    */
//   children: React.ReactNode;
// }

// /**
//  * A reusable dialog component designed to wrap form components.
//  * It is controlled by external state (like a Zustand store).
//  */
// export const ReusableFormDialog = ({
//   isOpen,
//   onClose,
//   title,
//   children,
// }: ReusableFormDialogProps) => {

//   // The `onOpenChange` event from ShadCN's Dialog is perfect for this.
//   // It fires with `false` when the user tries to close the dialog
//   // (by pressing Esc, clicking the 'x', or clicking the overlay).
//   // We simply connect it to our `onClose` function from the store.
//   const handleOpenChange = (open: boolean) => {
//     if (!open) {
//       onClose();
//     }
//   };

//   return (
//     <Dialog open={isOpen} onOpenChange={handleOpenChange}>
//       <DialogContent 
//         className="max-h-[100vh] overflow-y-auto"
//         onOpenAutoFocus={(e) => e.preventDefault()} // Prevents auto-focusing the first input, which can be jarring
//       >
//         <DialogHeader className="text-left">
//           <DialogTitle className="text-destructive text-center mb-4 text-xl font-bold">
//             {title}
//           </DialogTitle>
          
//           {/* 
//             The `DialogDescription` is a good semantic element, 
//             and `asChild` allows our children (the form) to be rendered
//             directly without an extra wrapper `div`.
//           */}
//           <DialogDescription asChild>
//             {children}
//           </DialogDescription>
//         </DialogHeader>
//       </DialogContent>
//     </Dialog>
//   );
// };
