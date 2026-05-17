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
import type { SkillCategory } from "@/components/admin/types";
import { SubmitButton } from "@/components/admin/actions/submit-button";
import { DeleteButton } from "@/components/admin/actions/delete-button";
import { cn } from "@/utils/cn";

interface Props {
  initial: SkillCategory[];
  bulkAction: (formData: FormData) => Promise<void>;
  createAction: (formData: FormData) => Promise<void>;
  deleteAction: (formData: FormData) => Promise<void>;
}

const ICON_OPTIONS = [
  "Layout",
  "Database",
  "Wrench",
  "Palette",
  "Box",
  "Cpu",
  "Sparkles",
];

export function SortableCategories({
  initial,
  bulkAction,
  createAction,
  deleteAction,
}: Props) {
  const [rows, setRows] = useState<SkillCategory[]>(initial);

  useEffect(() => {
    setRows(initial);
  }, [initial]);

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
      const from = prev.findIndex((r) => r.slug === active.id);
      const to = prev.findIndex((r) => r.slug === over.id);
      if (from === -1 || to === -1) return prev;
      return arrayMove(prev, from, to);
    });
  };

  const order = rows.map((r) => r.slug).join(",");

  return (
    <div className="flex flex-col gap-4">
      <AddCategoryForm action={createAction} />

      <form action={bulkAction} className="flex flex-col gap-3">
        <input type="hidden" name="category_order" value={order} />
        <div className="admin-table-wrap">
          <div className="admin-card overflow-hidden">
            <div className="hidden border-b admin-divider px-3 py-2 text-[10px] uppercase tracking-wider text-muted-foreground sm:grid sm:grid-cols-[2.25rem_minmax(0,1fr)_minmax(0,1fr)_8rem_3rem] sm:items-center sm:gap-3">
              <span></span>
              <span>Label (IT)</span>
              <span>Label (EN)</span>
              <span>Icon</span>
              <span></span>
            </div>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={onDragEnd}
            >
              <SortableContext
                items={rows.map((r) => r.slug)}
                strategy={verticalListSortingStrategy}
              >
                <ul className="list-none divide-y admin-divider p-0">
                  {rows.map((row) => (
                    <CategoryRow
                      key={row.slug}
                      row={row}
                      deleteAction={deleteAction}
                    />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <SubmitButton className="w-full sm:w-auto" pendingLabel="Saving…">
            Save categories
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}

function CategoryRow({
  row,
  deleteAction,
}: {
  row: SkillCategory;
  deleteAction: (formData: FormData) => Promise<void>;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: row.slug });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        "grid grid-cols-[2.25rem_minmax(0,1fr)_2rem] items-center gap-2 px-3 py-3 transition-colors sm:grid-cols-[2.25rem_minmax(0,1fr)_minmax(0,1fr)_8rem_3rem] sm:gap-3",
        isDragging && "z-10 bg-accent/40"
      )}
    >
      <input type="hidden" name={`cat[${row.slug}][__row]`} value="1" />

      <button
        type="button"
        aria-label={`Drag ${row.label_en}`}
        {...attributes}
        {...listeners}
        className="grid h-9 w-9 cursor-grab place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4" aria-hidden="true" />
      </button>

      <input
        name={`cat[${row.slug}][label_it]`}
        defaultValue={row.label_it}
        required
        aria-label="Italian label"
        className="admin-input"
      />

      <input
        name={`cat[${row.slug}][label_en]`}
        defaultValue={row.label_en}
        required
        aria-label="English label"
        className="admin-input hidden sm:block"
      />

      <select
        name={`cat[${row.slug}][icon]`}
        defaultValue={row.icon ?? ""}
        aria-label="Icon"
        className="admin-input hidden sm:block"
      >
        <option value="">— none —</option>
        {ICON_OPTIONS.map((i) => (
          <option key={i} value={i}>
            {i}
          </option>
        ))}
      </select>

      <DeleteButton
        action={deleteAction}
        fieldValue={row.slug}
        label={row.label_en}
        iconOnly
      />
    </li>
  );
}

function AddCategoryForm({
  action,
}: {
  action: (formData: FormData) => Promise<void>;
}) {
  return (
    <form
      action={action}
      className="admin-card grid grid-cols-2 gap-2 p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_10rem_auto] sm:gap-3"
    >
      <label className="flex flex-col gap-1.5">
        <span className="admin-eyebrow">Label (IT)</span>
        <input name="label_it" required placeholder="Design 3D" className="admin-input" />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="admin-eyebrow">Label (EN)</span>
        <input name="label_en" required placeholder="Design 3D" className="admin-input" />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="admin-eyebrow">Icon</span>
        <select name="icon" defaultValue="" className="admin-input">
          <option value="">— none —</option>
          {ICON_OPTIONS.map((i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </select>
      </label>
      <div className="col-span-2 flex items-end sm:col-span-1">
        <SubmitButton className="w-full" pendingLabel="Adding…">
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          Add category
        </SubmitButton>
      </div>
    </form>
  );
}
