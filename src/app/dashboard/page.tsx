import { getOrCreateUser } from "@/lib/get-or-create-user";

export default async function DashboardPage() {
  const user = await getOrCreateUser();

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
        Welcome{user?.name ? `, ${user.name}` : ""}
      </h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        No tasks yet — task management is coming in the next milestone.
      </p>
    </div>
  );
}
