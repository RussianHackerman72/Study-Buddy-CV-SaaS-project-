import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 py-12 dark:bg-black">
      <SignUp />
    </div>
  );
}
