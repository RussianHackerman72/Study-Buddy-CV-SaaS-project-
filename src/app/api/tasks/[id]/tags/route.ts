import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/get-or-create-user";

const assignTagSchema = z.object({ tagId: z.string().min(1) });

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteContext) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await getOrCreateUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: taskId } = await params;

  const body = await request.json();
  const parsed = assignTagSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const [task, tag] = await Promise.all([
    prisma.task.findUnique({ where: { id: taskId } }),
    prisma.tag.findUnique({ where: { id: parsed.data.tagId } }),
  ]);

  if (!task || task.userId !== user.id) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }
  if (!tag || tag.userId !== user.id) {
    return NextResponse.json({ error: "Tag not found" }, { status: 404 });
  }

  const taskTag = await prisma.taskTag.upsert({
    where: { taskId_tagId: { taskId, tagId: tag.id } },
    update: {},
    create: { taskId, tagId: tag.id },
    include: { tag: true },
  });

  return NextResponse.json(taskTag, { status: 201 });
}
