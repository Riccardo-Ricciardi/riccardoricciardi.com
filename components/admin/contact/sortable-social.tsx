"use client";

import { useEffect, useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Eye, EyeOff, GripVertical } from "lucide-react";
import type { SocialLink } from "@/components/admin/types";
import { SubmitButton } from "@/components/admin/actions/submit-button";
import { DeleteButton } from "@/components/admin/actions/delete-button";
import { cn } from "@/lib/utils";

interface Props {
  initial: SocialLink[];
  bulkAction: (formData: FormData) => Promise<void>;
  deleteAction: (formData: FormData) => Promise<void>;
}

export function SortableSocial({ initial, bulkAction, deleteAction }: Props) {
  const [rows, setRows] = useState<SocialLink[]>(initial);
  useEffect(() => setRows(initial), [initial]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setRows((prev) => {
      const from = prev.findIndex((r) => r.id === Number(active.id));
      const to = prev.findIndex((r) => r.id === Number(over.id));
      if (from === -1 || to === -1) return prev;
      return arrayMove(prev, from, to);
    });
  };

  const order = rows.map((r) => r.id).join(",");

  if (rows.length === 0) {
    return (
      <p className="rounded-lg border border-dashed admin-divider bg-background/40 px-4 py-6 text-center text-sm text-muted-foreground">
        No social links yet. Add the first one below.
      </p>
    );
  }

  return (
    <form action={bulkAction} className="flex flex-col gap-3">
      <input type="hidden" name="order" value={order} />
      <div className="admin-table-wrap">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={rows.map((r) => r.id)} strategy={verticalListSortingStrategy}>
            <div className="admin-card flex flex-col divide-y admin-divider overflow-hidden">
              {rows.map((row) => (
                <SortableRow key={row.id} row={row} deleteAction={deleteAction} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
      <SubmitButton className="w-full sm:w-auto sm:self-end" pendingLabel="Saving…">
        Save links
      </SubmitButton>
    </form>
  );
}

function SortableRow({
  row,
  deleteAction,
}: {
  row: SocialLink;
  deleteAction: (formData: FormData) => Promise<void>;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: row.id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "grid grid-cols-[2.25rem_minmax(0,1fr)_2.25rem_3rem] items-center gap-2 px-3 py-3 sm:grid-cols-[2.25rem_8rem_minmax(0,1fr)_minmax(0,1.4fr)_2.25rem_3rem] sm:gap-3",
        isDragging && "z-10 bg-accent/40"
      )}
    >
      <input type="hidden" name={`social[${row.id}][__row]`} value="1" />
      <button
        type="button"
        aria-label="Drag link"
        {...attributes}
        {...listeners}
        className="grid h-9 w-9 cursor-grab place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4" aria-hidden="true" />
      </button>

      <input
        name={`social[${row.id}][kind]`}
        defaultValue={row.kind}
        className="admin-input hidden sm:block"
        aria-label="Kind"
      />

      <input
        name={`social[${row.id}][label]`}
        defaultValue={row.label ?? ""}
        placeholder={row.kind}
        className="admin-input"
        aria-label="Label"
      />

      <input
        name={`social[${row.id}][url]`}
        defaultValue={row.url}
        required
        className="admin-input col-span-3 sm:col-span-1"
        aria-label="URL"
        placeholder="https://"
      />

      <label
        className="relative grid h-9 w-9 cursor-pointer place-items-center"
        title={row.visible ? "Visible" : "Hidden"}
      >
        <input
          type="checkbox"
          name={`social[${row.id}][visible]`}
          defaultChecked={row.visible}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-md border admin-divider transition-colors peer-checked:border-accent-blue peer-checked:bg-accent-blue-soft"
        />
        <EyeOff className="relative h-4 w-4 text-muted-foreground peer-checked:hidden" />
        <Eye className="relative hidden h-4 w-4 text-accent-blue peer-checked:block" />
      </label>

      <DeleteButton
        action={deleteAction}
        fieldValue={row.id}
        label={row.label ?? row.kind}
        iconOnly
      />
    </div>
  );
}
