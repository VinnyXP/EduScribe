import { useState } from "react"
import { Button } from "@/components/ui/button";
import { Input } from "./components/ui/input";
import { useAction } from "convex/react";
import { api } from "../convex/_generated/api";
import { Textarea } from "./components/ui/textarea";
//import { useUser } from "@clerk/clerk-react";

export default function App() {
  const [newUrl, setNewUrl] = useState("")
  const [summary, setSummary] = useState("")
  
  const extractTranscript = useAction(api.myFunctions.extractTranscript)
  function handleUrlChange(text) {
    setNewUrl(text)
    if (!text) {
      setSummary("")
    }
  }
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
          onChange={(event) => handleUrlChange(event.target.value)}
          placeholder="Enter your YouTube video url here"
        />
        <Textarea 
          value={summary}
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
            const summary = await extractTranscript({video_url: newUrl.trim()});
            setNewUrl("");
            setSummary(summary);
          }}
          className="min-w-fit"
        >
          Enter
        </Button>
      </div>
    </main>
  );
}

