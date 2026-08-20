"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  closestCorners,
  pointerWithin,
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { toast } from "sonner";
import { ArrowLeftIcon, ArchiveIcon, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  fetchTasks,
  updateTask,
  deleteTask,
  reorderTasks,
  type Status,
  type Task,
} from "@/lib/api/tasks";
import { BoardColumn } from "./board-column";
import { BoardCard } from "./board-card";
import { BoardDropZone } from "./board-drop-zone";
import { TaskFormDialog } from "./task-form-dialog";

const columns: Status[] = ["TODO", "IN_PROGRESS", "DONE"];
const ARCHIVE_ZONE = "archive-zone";
const TRASH_ZONE = "trash-zone";
const UNDO_WINDOW_MS = 5000;

type Board = Record<Status, Task[]>;

type PendingDelete = {
  task: Task;
  status: Status;
  index: number;
  timeoutId: ReturnType<typeof setTimeout>;
};

function groupByStatus(tasks: Task[]): Board {
  const board: Board = { TODO: [], IN_PROGRESS: [], DONE: [] };
  for (const task of tasks) board[task.status].push(task);
  for (const status of columns) board[status].sort((a, b) => a.order - b.order);
  return board;
}

function findColumn(id: string, board: Board): Status | null {
  if ((columns as string[]).includes(id)) return id as Status;
  for (const status of columns) {
    if (board[status].some((task) => task.id === id)) return status;
  }
  return null;
}

// closestCorners alone compares the whole dragged card's bounding box against
// every droppable's corners -- since the board columns span the full board
// height, their corners are almost always nearer than the small, remote
// archive/trash icons, so those targets would basically never win. Checking
// the actual pointer position first fixes that for small targets, while
// still falling back to closestCorners for the column drop zones.
const collisionDetection: CollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args);
  if (pointerCollisions.length > 0) return pointerCollisions;
  return closestCorners(args);
};

export function BoardView() {
  const queryClient = useQueryClient();
  const queryKey = ["tasks", "createdAt", null, ""];

  const {
    data: tasks,
    isLoading,
    isError,
  } = useQuery({
    queryKey,
    queryFn: () => fetchTasks({ sort: "createdAt", tagId: null, q: "" }),
  });

  const [board, setBoard] = useState<Board>(() =>
    tasks ? groupByStatus(tasks) : { TODO: [], IN_PROGRESS: [], DONE: [] },
  );
  const [syncedTasks, setSyncedTasks] = useState(tasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [createStatus, setCreateStatus] = useState<Status>("TODO");
  const [formOpen, setFormOpen] = useState(false);
  const pendingDeletesRef = useRef<Map<string, PendingDelete>>(new Map());

  // Reset local board state whenever fresh data arrives from the server, without
  // running the sync in an effect (see https://react.dev/learn/you-might-not-need-an-effect).
  if (tasks && tasks !== syncedTasks) {
    setSyncedTasks(tasks);
    setBoard(groupByStatus(tasks));
  }

  function resetBoardFromServer() {
    if (tasks) setBoard(groupByStatus(tasks));
  }

  const reorderMutation = useMutation({
    mutationFn: reorderTasks,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
    onError: (error: Error) => {
      toast.error(error.message);
      resetBoardFromServer();
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (task: Task) => updateTask(task.id, { archived: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task archived");
    },
    onError: (error: Error) => {
      toast.error(error.message);
      resetBoardFromServer();
    },
  });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  function removeFromBoard(task: Task) {
    setBoard((prev) => ({
      ...prev,
      [task.status]: prev[task.status].filter((item) => item.id !== task.id),
    }));
  }

  function handleArchive(task: Task) {
    removeFromBoard(task);
    archiveMutation.mutate(task);
  }

  // Soft delete: remove from view immediately and give the user a few seconds to
  // undo before the real DELETE call fires, instead of a blocking confirm dialog.
  function handleDelete(task: Task) {
    const status = task.status;
    const index = board[status].findIndex((item) => item.id === task.id);
    removeFromBoard(task);

    const timeoutId = setTimeout(() => {
      pendingDeletesRef.current.delete(task.id);
      deleteTask(task.id)
        .then(() => queryClient.invalidateQueries({ queryKey: ["tasks"] }))
        .catch((error: Error) => {
          toast.error(error.message);
          resetBoardFromServer();
        });
    }, UNDO_WINDOW_MS);

    pendingDeletesRef.current.set(task.id, { task, status, index, timeoutId });

    toast("Task deleted", {
      duration: UNDO_WINDOW_MS,
      action: {
        label: "Undo",
        onClick: () => {
          const pending = pendingDeletesRef.current.get(task.id);
          if (!pending) return;
          clearTimeout(pending.timeoutId);
          pendingDeletesRef.current.delete(task.id);
          setBoard((prev) => {
            const items = [...prev[pending.status]];
            items.splice(Math.min(pending.index, items.length), 0, pending.task);
            return { ...prev, [pending.status]: items };
          });
        },
      },
    });
  }

  function handleDragStart(event: DragStartEvent) {
    const column = findColumn(event.active.id as string, board);
    if (!column) return;
    setActiveTask(board[column].find((task) => task.id === event.active.id) ?? null);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;
    const activeId = active.id as string;
    const overId = over.id as string;
    const activeColumn = findColumn(activeId, board);
    const overColumn = findColumn(overId, board);
    if (!activeColumn || !overColumn || activeColumn === overColumn) return;

    setBoard((prev) => {
      const activeItems = prev[activeColumn];
      const overItems = prev[overColumn];
      const activeIndex = activeItems.findIndex((task) => task.id === activeId);
      if (activeIndex === -1) return prev;
      let overIndex = overItems.findIndex((task) => task.id === overId);
      if (overIndex === -1) overIndex = overItems.length;
      const movedTask = { ...activeItems[activeIndex], status: overColumn };
      return {
        ...prev,
        [activeColumn]: activeItems.filter((task) => task.id !== activeId),
        [overColumn]: [...overItems.slice(0, overIndex), movedTask, ...overItems.slice(overIndex)],
      };
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;
    const activeId = active.id as string;
    const overId = over.id as string;

    if (overId === ARCHIVE_ZONE || overId === TRASH_ZONE) {
      const column = findColumn(activeId, board);
      const task = column ? board[column].find((item) => item.id === activeId) : undefined;
      if (!task) return;
      if (overId === ARCHIVE_ZONE) handleArchive(task);
      else handleDelete(task);
      return;
    }

    const activeColumn = findColumn(activeId, board);
    const overColumn = findColumn(overId, board);
    if (!activeColumn || !overColumn) return;

    let finalBoard = board;
    if (activeColumn === overColumn) {
      const items = board[activeColumn];
      const oldIndex = items.findIndex((task) => task.id === activeId);
      const newIndex = items.findIndex((task) => task.id === overId);
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        finalBoard = { ...board, [activeColumn]: arrayMove(items, oldIndex, newIndex) };
        setBoard(finalBoard);
      }
    }

    const affectedColumns =
      activeColumn === overColumn ? [activeColumn] : [activeColumn, overColumn];
    const updates = affectedColumns.flatMap((status) =>
      finalBoard[status].map((task, index) => ({ id: task.id, status, order: index })),
    );
    reorderMutation.mutate(updates);
  }

  function openEditForm(task: Task) {
    setEditingTask(task);
    setFormOpen(true);
  }

  function openCreateForm(status: Status) {
    setEditingTask(undefined);
    setCreateStatus(status);
    setFormOpen(true);
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 px-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            nativeButton={false}
            render={<Link href="/dashboard" />}
          >
            <ArrowLeftIcon className="size-4" />
            <span className="sr-only">Back to tasks</span>
          </Button>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            Board
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <BoardDropZone id={ARCHIVE_ZONE} icon={ArchiveIcon} label="Archive" />
          <BoardDropZone id={TRASH_ZONE} icon={Trash2} label="Delete" variant="destructive" />
        </div>
      </div>

      {isLoading && (
        <div className="flex gap-3">
          <Skeleton className="h-64 w-full rounded-lg sm:w-72" />
          <Skeleton className="h-64 w-full rounded-lg sm:w-72" />
          <Skeleton className="h-64 w-full rounded-lg sm:w-72" />
        </div>
      )}

      {isError && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
          Couldn&apos;t load your tasks. Try refreshing the page.
        </p>
      )}

      {!isLoading && !isError && (
        <DndContext
          sensors={sensors}
          collisionDetection={collisionDetection}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:overflow-x-auto">
            {columns.map((status) => (
              <BoardColumn
                key={status}
                status={status}
                tasks={board[status]}
                onCardClick={openEditForm}
                onAddTask={openCreateForm}
                onArchive={handleArchive}
                onDelete={handleDelete}
              />
            ))}
          </div>
          <DragOverlay>
            {activeTask && (
              <BoardCard
                task={activeTask}
                onClick={() => {}}
                onArchive={() => {}}
                onDelete={() => {}}
              />
            )}
          </DragOverlay>
        </DndContext>
      )}

      <TaskFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        task={editingTask}
        defaultStatus={createStatus}
      />
    </div>
  );
}
