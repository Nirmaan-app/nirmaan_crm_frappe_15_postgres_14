// ReusableDialog.tsx
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import React from "react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./dialog";

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


export interface ReusableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  confirmText?: string;
  cancelButton?: boolean;
  cancelText?: string;
  onConfirm: () => void;
  children?: React.ReactNode;
  disableConfirm?: boolean;
  loading?: boolean;
  cancelConfirm?: () => void;
}

export const ReusableDialog: React.FC<ReusableDialogProps> = ({
  open,
  onOpenChange,
  title,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  children,
  disableConfirm = false,
  loading = false,
  cancelButton = true,
  cancelConfirm,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className="text-start">
          <DialogTitle className="text-destructive text-center">
            {title}
          </DialogTitle>
          <DialogDescription asChild>
            <div>{children}</div>
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-end gap-2">
          {cancelButton ? (
            <DialogClose className="flex-1" asChild>
              <Button variant={"outline"}>
                {cancelText}
              </Button>
            </DialogClose>
          ) : (
            <Button onClick={cancelConfirm} variant={"outline"} className="flex-1">
              {cancelText}
            </Button>
          )}
          <Button disabled={disableConfirm} onClick={onConfirm} className="flex-1">
            {confirmText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
