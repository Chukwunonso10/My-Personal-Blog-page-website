import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-stone-50 dark:bg-neutral-950 px-6 py-12 transition-colors duration-300">
      <SignIn />
    </div>
  );
}
