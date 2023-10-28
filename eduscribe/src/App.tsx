import { useState } from "react"
import { Button } from "@/components/ui/button";
import { Input } from "./components/ui/input";
import { SignInButton, UserButton } from "@clerk/clerk-react";
import {
  Authenticated,
  Unauthenticated,
  useMutation,
  useQuery,
} from "convex/react";
import { api } from "../convex/_generated/api";

export default function App() {
  const [newTranscript, setNewTranscript] = useState("")
  const addTranscript = useMutation(api.myFunctions.addTranscript)

  return (
    <main className="container max-w-2xl flex flex-col gap-8">
      <h1 className="text-4xl font-extrabold my-8 text-center">
        EduScribe
      </h1>
      
      <Authenticated>
        <SignedIn />
      </Authenticated>

      <div className="flex gap-2">
          <Input
            type="text"
            value={newTranscript}
            onChange={(event) => setNewTranscript(event.target.value)}
            placeholder="Input your transcript here."
          />
          <Button
            disabled={!newTranscript}
            title={
              newTranscript
                ? "Save your transcript to the database"
                : "You must enter a transcript first"
            }
            onClick={async () => {
              await addTranscript({video_url: newTranscript.trim()})
              setNewTranscript("")
            }}
            className="min-w-fit"
          >
            Input
          </Button>
        </div>

      <Unauthenticated>
        <div className="flex justify-center">
          <SignInButton mode="modal">
            <Button>Sign In</Button>
          </SignInButton>
        </div>
      </Unauthenticated>
    </main>
  );
}

function SignedIn() {
  const { numbers, viewer } =
    useQuery(api.myFunctions.listNumbers, {
      count: 10,
    }) ?? {};
  const addNumber = useMutation(api.myFunctions.addNumber);

  return (
    <>
      <p>Welcome {viewer}!</p>
      <p className="flex gap-4 items-center">
        This is you:
        <UserButton afterSignOutUrl="#" />
      </p>
      <p>
        Click the button below and open this page in another window - this data
        is persisted in the Convex cloud database!
      </p>
      <p>
        <Button
          onClick={() => {
            void addNumber({ value: Math.floor(Math.random() * 10) });
          }}
        >
          Add a random number
        </Button>
      </p>
      <p>
        Numbers:{" "}
        {numbers?.length === 0
          ? "Click the button!"
          : numbers?.join(", ") ?? "..."}
      </p>
      <p>
        Edit{" "}
        <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
          convex/myFunctions.ts
        </code>{" "}
        to change your backend
      </p>
      <p>
        Edit{" "}
        <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
          src/App.tsx
        </code>{" "}
        to change your frontend
      </p>
      <p>
        Check out{" "}
        <a
          className="font-medium text-primary underline underline-offset-4"
          target="_blank"
          href="https://docs.convex.dev/home"
        >
          Convex docs
        </a>
      </p>
    </>
  );
}
