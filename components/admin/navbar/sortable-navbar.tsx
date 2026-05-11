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
import { GripVertical } from "lucide-react";
import { SubmitButton } from "@/components/admin/actions/submit-button";
import { DeleteButton } from "@/components/admin/actions/delete-button";
import { cn } from "@/lib/utils";

export type NavGroup = {
  slug: string;
  perLang: Record<number, string>;
};

interface Props {
  initial: NavGroup[];
  languages: Array<{ id: number; code: string; name: string }>;
  bulkAction: (formData: FormData) => Promise<void>;
  deleteAction: (formData: FormData) => Promise<void>;
}

export function SortableNavbar({
  initial,
  languages,
  bulkAction,
  deleteAction,
}: Props) {
  const [rows, setRows] = useState<NavGroup[]>(initial);
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
      const from = prev.findIndex((r) => r.slug === String(active.id));
      const to = prev.findIndex((r) => r.slug === String(over.id));
      if (from === -1 || to === -1) return prev;
      return arrayMove(prev, from, to);
    });
  };

  const order = rows.map((r) => r.slug).join(",");

  if (rows.length === 0) {
    return (
      <p className="rounded-lg border border-dashed admin-divider bg-background/40 px-4 py-6 text-center text-sm text-muted-foreground">
        No navbar items yet.
      </p>
    );
  }

  return (
    <form action={bulkAction} className="flex flex-col gap-3">
      <input type="hidden" name="order" value={order} />
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext
          items={rows.map((r) => r.slug)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-2">
            {rows.map((row) => (
              <SortableRow
                key={row.slug}
                row={row}
                languages={languages}
                deleteAction={deleteAction}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <SubmitButton className="w-full sm:w-auto sm:self-end" pendingLabel="Saving…">
        Save navbar
      </SubmitButton>
    </form>
  );
}

function SortableRow({
  row,
  languages,
  deleteAction,
}: {
  row: NavGroup;
  languages: Array<{ id: number; code: string; name: string }>;
  deleteAction: (formData: FormData) => Promise<void>;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: row.slug });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "admin-card flex items-start gap-3 p-3",
        isDragging && "z-10 shadow-md"
      )}
    >
      <button
        type="button"
        aria-label="Drag slug"
        {...attributes}
        {...listeners}
        className="mt-1 grid h-9 w-9 cursor-grab place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4" aria-hidden="true" />
      </button>

      <div className="flex flex-1 flex-col gap-2">
        <label className="flex flex-col gap-1.5">
          <span className="admin-eyebrow">Slug (empty = home)</span>
          <input
            name={`nav[${row.slug}][slug]`}
            defaultValue={row.slug}
            className="admin-input font-mono"
            placeholder="about"
          />
        </label>
        <div className="grid gap-2 sm:grid-cols-2">
          {languages.map((lang) => (
            <label key={lang.id} className="flex flex-col gap-1.5">
              <span className="admin-eyebrow">{lang.code} label</span>
              <input
                name={`nav[${row.slug}][value][${lang.id}]`}
                defaultValue={row.perLang[lang.id] ?? ""}
                placeholder={lang.name}
                className="admin-input"
              />
            </label>
          ))}
        </div>
      </div>

      <DeleteButton
        action={deleteAction}
        fieldValue={row.slug}
        label={`slug "${row.slug || "home"}"`}
        iconOnly
        className="mt-1"
      />
    </div>
  );
}
