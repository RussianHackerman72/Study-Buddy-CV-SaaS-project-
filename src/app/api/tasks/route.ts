import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/get-or-create-user";
import { createTaskSchema } from "@/lib/validations/task";

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await getOrCreateUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sort = new URL(request.url).searchParams.get("sort");

  const orderBy: Prisma.TaskOrderByWithRelationInput[] =
    sort === "priority"
      ? [{ priority: "desc" }, { createdAt: "desc" }]
      : sort === "dueDate"
        ? [{ dueDate: { sort: "asc", nulls: "last" } }, { createdAt: "desc" }]
        : [{ createdAt: "desc" }];

  const tasks = await prisma.task.findMany({
    where: { userId: user.id, archived: false },
    include: { subtasks: true, tags: { include: { tag: true } } },
    orderBy,
  });

  return NextResponse.json(tasks);
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await getOrCreateUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = createTaskSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const task = await prisma.task.create({
    data: { ...parsed.data, userId: user.id },
  });

  return NextResponse.json(task, { status: 201 });
}
