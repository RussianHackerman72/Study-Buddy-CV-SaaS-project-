import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/get-or-create-user";
import { reorderTasksSchema } from "@/lib/validations/task";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await getOrCreateUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = reorderTasksSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const ids = parsed.data.updates.map((update) => update.id);
  const owned = await prisma.task.findMany({
    where: { id: { in: ids }, userId: user.id },
    select: { id: true },
  });
  if (owned.length !== ids.length) {
    return NextResponse.json({ error: "One or more tasks not found" }, { status: 404 });
  }

  await prisma.$transaction(
    parsed.data.updates.map((update) =>
      prisma.task.update({
        where: { id: update.id },
        data: { status: update.status, order: update.order },
      }),
    ),
  );

  return NextResponse.json({ success: true });
}
