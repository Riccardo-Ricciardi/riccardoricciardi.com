"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
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
import { GripVertical, Upload } from "lucide-react";
import type { Skill, SkillCategory } from "@/components/admin/types";
import { SubmitButton } from "@/components/admin/actions/submit-button";
import { DeleteButton } from "@/components/admin/actions/delete-button";
import { cn } from "@/utils/cn";

interface Props {
  initial: Skill[];
  categories: SkillCategory[];
  bulkAction: (formData: FormData) => Promise<void>;
  deleteAction: (formData: FormData) => Promise<void>;
}

export function SortableSkills({
  initial,
  categories,
  bulkAction,
  deleteAction,
}: Props) {
  const [rows, setRows] = useState<Skill[]>(initial);

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
    <form action={bulkAction} className="flex flex-col gap-3">
      <input type="hidden" name="order" value={order} />
      <div className="admin-table-wrap">
        <div className="admin-card overflow-hidden">
          <div className="hidden border-b admin-divider px-3 py-2 text-[10px] uppercase tracking-wider text-muted-foreground sm:grid sm:grid-cols-[2.25rem_2.75rem_minmax(0,1fr)_8rem_7rem_5.5rem_3rem] sm:items-center sm:gap-3">
            <span></span>
            <span>Icon</span>
            <span>Name</span>
            <span>Category</span>
            <span>Level</span>
            <span>Dark</span>
            <span></span>
          </div>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
          >
            <SortableContext
              items={rows.map((r) => r.id)}
              strategy={verticalListSortingStrategy}
            >
              <ul className="list-none divide-y admin-divider p-0">
                {rows.map((row) => (
                  <SortableRow
                    key={row.id}
                    row={row}
                    categories={categories}
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
          Save changes
        </SubmitButton>
      </div>
    </form>
  );
}

function SortableRow({
  row,
  categories,
  deleteAction,
}: {
  row: Skill;
  categories: SkillCategory[];
  deleteAction: (formData: FormData) => Promise<void>;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: row.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const iconSrc = row.icon_url;

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        "grid grid-cols-[2.25rem_2.75rem_minmax(0,1fr)_5rem_2rem] items-center gap-2 px-3 py-3 transition-colors sm:grid-cols-[2.25rem_2.75rem_minmax(0,1fr)_8rem_7rem_5.5rem_3rem] sm:gap-3",
        isDragging && "z-10 bg-accent/40"
      )}
    >
      <input type="hidden" name={`skill[${row.id}][__row]`} value="1" />

      <button
        type="button"
        aria-label={`Drag ${row.name}`}
        {...attributes}
        {...listeners}
        className="grid size-9 cursor-grab place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground active:cursor-grabbing"
      >
        <GripVertical className="size-4" aria-hidden="true" />
      </button>

      <Link
        href={`/admin/skills/${row.id}`}
        title="Manage icon"
        className="relative grid size-10 place-items-center rounded-md border admin-divider bg-background/50 hover:border-accent-blue"
      >
        {iconSrc ? (
          <Image
            src={iconSrc}
            alt=""
            width={32}
            height={32}
            sizes="32px"
            className="size-7 object-contain"
          />
        ) : (
          <Upload className="size-3.5 text-muted-foreground" aria-hidden="true" />
        )}
      </Link>

      <div className="min-w-0">
        <input
          name={`skill[${row.id}][name]`}
          defaultValue={row.name}
          required
          aria-label="Skill name"
          className="admin-input"
        />
      </div>

      <div className="hidden sm:block">
        <select
          name={`skill[${row.id}][category]`}
          defaultValue={row.category ?? ""}
          aria-label="Category"
          className="admin-input"
        >
          <option value="">(none)</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.label_en}
            </option>
          ))}
        </select>
      </div>

      <div className="relative">
        <input
          type="number"
          name={`skill[${row.id}][percentage]`}
          defaultValue={row.percentage ?? 0}
          min={0}
          max={100}
          aria-label="Proficiency"
          className="admin-input tabular-nums pr-7"
        />
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 font-mono text-[10px] text-muted-foreground">
          %
        </span>
      </div>

      <label className="hidden cursor-pointer items-center gap-2 text-xs text-muted-foreground sm:flex">
        <input
          type="checkbox"
          name={`skill[${row.id}][dark]`}
          defaultChecked={row.dark || !!row.icon_dark_url}
          className="size-3.5 rounded accent-[var(--accent-blue)]"
        />
        <span>dark</span>
      </label>

      <DeleteButton
        action={deleteAction}
        fieldValue={row.id}
        label={row.name}
        iconOnly
      />
    </li>
  );
}
