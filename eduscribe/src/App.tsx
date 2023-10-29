import { useState } from "react"
import { Button } from "@/components/ui/button";
import { Input } from "./components/ui/input";
import {
  useMutation,
  useAction,
  useQuery,
} from "convex/react";
import { api } from "../convex/_generated/api";
import { Textarea } from "./components/ui/textarea";
import { useUser } from "@clerk/clerk-react";


export default function App() {
  const [newUrl, setNewUrl] = useState("")
  const [summary, setSummary] = useState("")
  
  const extractTranscript = useAction(api.myFunctions.extractTranscript)
  const showAnalysis = useQuery(api.myFunctions.showAnalysis)
  return (
    <main className="container max-w-2xl flex flex-col gap-8">
      <h1 className="text-4xl font-extrabold my-8 text-center">
        EduScribe
      </h1>
      <h2 className="text-center">
        Using AI to turn watching minutes into seconds
      </h2>
      <div className="flex flex-col items-center gap-2">
        <Input
          type="text"
          value={newUrl}
          onChange={(event) => setNewUrl(event.target.value)}
          placeholder="Enter your YouTube video url here"
        />
        <Textarea 
          value={summary}
          //onChange={(event) => setSummary(event.target.value)}
          placeholder="Summary"
          style={{ marginTop: "10px" }}
          />

        <Button
          disabled={!newUrl}
          title={
            newUrl
              ? "Save your transcript to the database"
              : "You must enter a transcript first"
          }
          onClick={async () => {
            console.log("3");
            await extractTranscript({video_url: newUrl.trim()})
            //await addVideo({video_url: newUrl.trim()})
            setNewUrl("")
          }}
          className="min-w-fit"
        >
          Enter
        </Button>
      </div>
    </main>
  );
}

/*function SignedIn() {
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
}*/
