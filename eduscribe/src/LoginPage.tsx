import { SignInButton } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
export default function LoginPage() {
  return (
    <main>
      <h1 className="text-4xl font-extrabold my-8 text-center">
        EduScribe
      </h1>
      <h2 className="text-2xl font-extrabold my-8 text-center">
        Using AI to turn watching minutes into moments
      </h2>
      <div className="flex justify-center">
        <h2>
          <SignInButton mode="modal">
            <Button>Sign In</Button>
          </SignInButton>
        </h2>
      </div>
    </main>
  );
}