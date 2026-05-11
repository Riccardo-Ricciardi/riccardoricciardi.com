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
import { GripVertical, Plus } from "lucide-react";
import type { AboutSection } from "@/components/admin/types";
import { SubmitButton } from "@/components/admin/actions/submit-button";
import { DeleteButton } from "@/components/admin/actions/delete-button";
import { cn } from "@/lib/utils";

interface Props {
  initial: AboutSection[];
  languageId: number;
  languageCode: string;
  bulkAction: (formData: FormData) => Promise<void>;
  createAction: (formData: FormData) => Promise<void>;
  deleteAction: (formData: FormData) => Promise<void>;
}

export function SortableAbout({
  initial,
  languageId,
  languageCode,
  bulkAction,
  createAction,
  deleteAction,
}: Props) {
  const [rows, setRows] = useState<AboutSection[]>(initial);

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

  return (
    <div className="flex flex-col gap-3">
      {rows.length > 0 ? (
        <form action={bulkAction} className="flex flex-col gap-3">
          <input type="hidden" name="order" value={order} />
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={rows.map((r) => r.id)} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col gap-2">
                {rows.map((row) => (
                  <SortableRow key={row.id} row={row} deleteAction={deleteAction} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          <SubmitButton className="w-full sm:w-auto sm:self-end" pendingLabel="Saving…">
            Save {languageCode} sections
          </SubmitButton>
        </form>
      ) : (
        <p className="rounded-lg border border-dashed admin-divider bg-background/40 px-4 py-6 text-center text-sm text-muted-foreground">
          No sections yet for {languageCode}. Add the first one below.
        </p>
      )}

      <form
        action={createAction}
        className="flex items-center justify-end gap-2"
      >
        <input type="hidden" name="language_id" value={languageId} />
        <SubmitButton variant="ghost" pendingLabel="Adding…">
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          Add section
        </SubmitButton>
      </form>
    </div>
  );
}

function SortableRow({
  row,
  deleteAction,
}: {
  row: AboutSection;
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
        "admin-card grid grid-cols-[2.25rem_minmax(0,1fr)_3rem] items-start gap-2 p-3 sm:gap-3",
        isDragging && "z-10 shadow-md"
      )}
    >
      <input type="hidden" name={`about[${row.id}][__row]`} value="1" />
      <button
        type="button"
        aria-label="Drag section"
        {...attributes}
        {...listeners}
        className="mt-1 grid h-9 w-9 cursor-grab place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4" aria-hidden="true" />
      </button>
      <div className="flex flex-col gap-2">
        <input
          name={`about[${row.id}][heading]`}
          defaultValue={row.heading ?? ""}
          placeholder="Heading (optional)"
          className="admin-input font-medium"
        />
        <textarea
          name={`about[${row.id}][body]`}
          defaultValue={row.body}
          rows={4}
          placeholder="Body…"
          className="admin-input min-h-24 resize-y"
        />
      </div>
      <DeleteButton
        action={deleteAction}
        fieldValue={row.id}
        label={row.heading ?? "section"}
        iconOnly
        className="mt-1"
      />
    </div>
  );
}
