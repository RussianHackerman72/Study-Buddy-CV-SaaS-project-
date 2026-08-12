import { getOrCreateUser } from "@/lib/get-or-create-user";
import { TasksView } from "@/components/tasks/tasks-view";

export default async function DashboardPage() {
  await getOrCreateUser();

  return <TasksView />;
}
