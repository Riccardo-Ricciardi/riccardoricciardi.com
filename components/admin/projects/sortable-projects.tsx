"use client";

import Link from "next/link";
import Image from "next/image";
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
import type { Project } from "@/components/admin/types";
import { SubmitButton } from "@/components/admin/actions/submit-button";
import { DeleteButton } from "@/components/admin/actions/delete-button";
import { cn } from "@/lib/utils";

interface Props {
  initial: Project[];
  bulkAction: (formData: FormData) => Promise<void>;
  deleteAction: (formData: FormData) => Promise<void>;
}

export function SortableProjects({ initial, bulkAction, deleteAction }: Props) {
  const [rows, setRows] = useState<Project[]>(initial);

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
      const from = prev.findIndex((r) => r.id === String(active.id));
      const to = prev.findIndex((r) => r.id === String(over.id));
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
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={rows.map((r) => r.id)} strategy={verticalListSortingStrategy}>
              <ul className="list-none divide-y admin-divider p-0">
                {rows.map((row) => (
                  <SortableRow key={row.id} row={row} deleteAction={deleteAction} />
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
  deleteAction,
}: {
  row: Project;
  deleteAction: (formData: FormData) => Promise<void>;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: row.id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const imgSrc =
    row.screenshot_url ||
    row.og_image ||
    `https://opengraph.githubassets.com/1/${row.repo}`;

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        "grid grid-cols-[2.25rem_4rem_minmax(0,1fr)_2.5rem_3rem] items-center gap-2 px-3 py-3 sm:grid-cols-[2.25rem_5.5rem_minmax(0,1fr)_4rem_3rem] sm:gap-3",
        isDragging && "z-10 bg-accent/40"
      )}
    >
      <input type="hidden" name={`project[${row.id}][__row]`} value="1" />
      <button
        type="button"
        aria-label={`Drag ${row.repo}`}
        {...attributes}
        {...listeners}
        className="grid h-9 w-9 cursor-grab place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4" aria-hidden="true" />
      </button>

      <Link
        href={`/admin/projects/${row.id}`}
        className="relative block aspect-[16/9] w-14 overflow-hidden rounded-md border admin-divider bg-muted/30 hover:border-accent-blue sm:w-20"
        aria-label={`Edit ${row.repo}`}
      >
        <Image
          src={imgSrc}
          alt=""
          fill
          sizes="80px"
          className="object-cover"
          unoptimized
        />
      </Link>

      <Link href={`/admin/projects/${row.id}`} className="min-w-0">
        <p className="truncate font-mono text-sm font-medium hover:text-accent-blue">
          {row.repo}
        </p>
        <p className="truncate text-[11px] text-muted-foreground">
          {row.name ?? "—"}{" "}
          {row.language && (
            <span className="ml-1 font-mono">· {row.language}</span>
          )}
          {row.stars !== null && row.stars > 0 && (
            <span className="ml-1 font-mono">· ★{row.stars}</span>
          )}
        </p>
      </Link>

      <label
        className="relative grid h-9 w-9 cursor-pointer place-items-center"
        title={row.visible ? "Visible on site" : "Hidden"}
      >
        <input
          type="checkbox"
          name={`project[${row.id}][visible]`}
          defaultChecked={row.visible ?? false}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-md border admin-divider transition-colors peer-checked:border-accent-blue peer-checked:bg-accent-blue-soft"
        />
        <EyeOff
          className="relative h-4 w-4 text-muted-foreground peer-checked:hidden"
          aria-hidden="true"
        />
        <Eye
          className="relative hidden h-4 w-4 text-accent-blue peer-checked:block"
          aria-hidden="true"
        />
      </label>

      <DeleteButton
        action={deleteAction}
        fieldValue={row.id}
        label={row.repo}
        iconOnly
      />
    </li>
  );
}
