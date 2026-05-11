"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
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
import { cn } from "@/lib/utils";

interface DeleteButtonProps {
  action: (formData: FormData) => void | Promise<void>;
  fieldName?: string;
  fieldValue: string | number;
  label: string;
  hiddenFields?: Record<string, string | number>;
  iconOnly?: boolean;
  className?: string;
}

export function DeleteButton({
  action,
  fieldName = "delete",
  fieldValue,
  label,
  hiddenFields,
  iconOnly = false,
  className,
}: DeleteButtonProps) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          aria-label={`Delete ${label}`}
          className={cn(
            "admin-button admin-button-danger admin-tap-44",
            iconOnly ? "h-9 w-9 px-0 min-h-9 min-w-9" : "",
            className
          )}
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          {!iconOnly && <span>Delete</span>}
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {label}?</AlertDialogTitle>
          <AlertDialogDescription>
            This action is permanent. The record will be removed from the
            database immediately.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form
          action={(formData) => {
            setPending(true);
            return Promise.resolve(action(formData));
          }}
        >
          <input type="hidden" name={fieldName} value={String(fieldValue)} />
          {hiddenFields &&
            Object.entries(hiddenFields).map(([k, v]) => (
              <input key={k} type="hidden" name={k} value={String(v)} />
            ))}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
              <button
                type="submit"
                disabled={pending}
                className="admin-button bg-destructive text-destructive-foreground hover:opacity-90 disabled:opacity-60"
              >
                {pending && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                )}
                {pending ? "Deleting…" : "Delete"}
              </button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
