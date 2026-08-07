import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

const features = [
  "Create tasks with due dates, priority, and status",
  "Break work down into subtasks with progress tracking",
  "Tag and filter tasks the way that matches how you think",
  "Search across everything, archive what's done",
];

export default async function Home() {
  const { userId } = await auth();

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-6 dark:bg-black">
      <main className="flex w-full max-w-2xl flex-col items-center gap-10 py-24 text-center">
        <div className="flex flex-col items-center gap-4">
          <span className="text-sm font-medium tracking-wide text-indigo-600 uppercase dark:text-indigo-400">
            Flowlist
          </span>
          <h1 className="text-4xl font-semibold tracking-tight text-balance text-zinc-950 sm:text-5xl dark:text-zinc-50">
            A task manager that stays out of your way
          </h1>
          <p className="max-w-md text-lg text-balance text-zinc-600 dark:text-zinc-400">
            Plan, tag, and track your work without the clutter. Built for people who just want to
            get things done.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          {userId ? (
            <Button size="lg" nativeButton={false} render={<Link href="/dashboard" />}>
              Go to Dashboard
            </Button>
          ) : (
            <>
              <Button size="lg" nativeButton={false} render={<Link href="/sign-up" />}>
                Get Started
              </Button>
              <Button
                size="lg"
                variant="outline"
                nativeButton={false}
                render={<Link href="/sign-in" />}
              >
                Sign In
              </Button>
            </>
          )}
        </div>

        <ul className="flex w-full flex-col gap-3 text-left">
          {features.map((feature) => (
            <li
              key={feature}
              className="flex items-start gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
              {feature}
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
