import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/get-or-create-user";

type RouteContext = { params: Promise<{ id: string; tagId: string }> };

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await getOrCreateUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: taskId, tagId } = await params;

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task || task.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.taskTag.deleteMany({ where: { taskId, tagId } });
  return NextResponse.json({ success: true });
}
