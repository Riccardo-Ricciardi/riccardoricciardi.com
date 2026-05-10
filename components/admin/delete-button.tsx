"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface DeleteButtonProps {
  action: (formData: FormData) => void | Promise<void>;
  fieldName: string;
  fieldValue: string | number;
  label: string;
  description?: string;
  triggerClassName?: string;
}

export function DeleteButton({
  action,
  fieldName,
  fieldValue,
  label,
  description = "This cannot be undone.",
  triggerClassName = "font-mono text-[10px] uppercase tracking-wider text-red-600 hover:underline",
}: DeleteButtonProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger className={triggerClassName}>
        Delete
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {label}?</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <form action={action}>
            <input type="hidden" name={fieldName} value={fieldValue} />
            <AlertDialogAction
              type="submit"
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Yes, delete
            </AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
