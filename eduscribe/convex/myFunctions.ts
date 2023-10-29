import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { api } from "./_generated/api";

// Write your Convex functions in any file inside this directory (`convex`).
// See https://docs.convex.dev/functions for more.

const INSTRUCTIONS = "[INST]\nGiven the transcript of a youtube video, generate a high quality summary of the relevant content. Organize the information in a clear and easy-to-read format.\n[\INST]\n\n";
const SAMPLE_TRANSCRIPT = "in today's video we're going to look at electromagnetism which is the phenomenon whereby electric currents produce their own magnetic fields and we'll see how this works in ordinary wires coils solenoids and electromagnets let's start by imagining that we had a wire and that we let current flow through it from bottom to top this electric current would produce its own magnetic field all around the wire which we can represent with field lines in this case the field lines would be concentric circles around the wire and they'd be closest together near to the wire as that's where the magnetic field is strongest the direction of the magnetic field though is going to depend on the direction of the current so to help us remember which way it goes we can use something called the right hand rule if you take your right hand curl it into a fist and point your thumb in the direction that the current is flowing then the direction that your fingers are curling in tells you the direction of the magnetic field so for our wire in which the current is going upwards the magnetic field would be going anti-clockwise and so we would mark each of our concentric circles with little arrows in that direction however if we had another wire with the current going in the opposite direction then by using the right hand rule again with our hand upside down this time we see that the magnetic field is now traveling in the opposite direction to make things a bit trickier let's now imagine that instead of two separate straight wires we instead joined them together so that we had a single flat circular coil with the current flowing in through the bottom left and out through the right as the magnetic fields of the two sides of our coil interact the magnetic fields which were concentric circles will now get stretched out and form ellipses and as the magnetic fields combine they'll form a single magnetic field which runs straight through the center of the coil which if we were to look at it from above would look like this if we now add a lot more turns to our coil all next to each other in one long piece of wire we make something called a solenoid and importantly the magnetic field within a solenoid is strong and uniform outside the coil the field is just like the one we'd find around a bar magnet and just like a bar magnet where the field lines come out is the north pole and where they point in is the south pole so we've effectively used electricity to create a magnet and so we call it an electromagnet one of the useful things about electromagnets is that they're only magnetic for as long as we keep the current flowing through the wire as soon as we turn off the power source the magnetic field disappears and when we turn it back on it comes back as well as being able to turn it on and off we can also reverse the direction of the magnetic field by reversing the direction in which our current is flowing we can show this by reversing the direction of our little current arrows and each time we flip them the direction of our field lines and the sides of the poles will also flip around indicating that our magnetic field has flipped directions now the problem with our electromagnets here is that a small electromagnet like this one would only produce a very weak magnetic field so you need to know the four ways that we can increase an electromagnet strength the most obvious way is just to increase the current that flows through the solenoid second we can increase the number of turns in our coil while keeping the length of the solenoid the same and similarly we could decrease the length of the coil while keeping the number of turns the same basically solenoids that have very densely packed coils will be the strongest the last thing we can do is add an iron core to the inside of our solenoid as iron is a soft magnetic material it will become an induced magnet when the solenoid is switched on which will massively increase the strength of the electromagnet's magnetic field but importantly it will also lose its magnetic field as soon as the current is turned off anyway that's all for today so hope you enjoyed it and we'll see you next time"
const SAMPLE_SUMMARY = "The video is an educational piece on electromagnetism, specifically focusing on how electric currents produce their own magnetic fields. It starts by explaining the concept using a wire with current flowing from bottom to top, which creates a magnetic field around the wire. The presenter uses the right-hand rule to explain the direction of the magnetic field, which is represented by concentric circles around the wire.The video then introduces a second wire with current flowing in the opposite direction, demonstrating that the magnetic field also travels in the opposite direction. The presenter then combines the two wires into a single flat circular coil, explaining how the magnetic fields interact and form a single magnetic field running through the center of the coil.\nThe video progresses to discuss solenoids, which are created by adding more turns to the coil. The presenter explains that the magnetic field within a solenoid is strong and uniform, and outside the coil, the field is similar to that of a bar magnet. The video then introduces the concept of electromagnets, which are essentially solenoids that can be turned on and off by controlling the current flow.\nThe presenter concludes by discussing ways to increase the strength of an electromagnet. These include increasing the current flowing through the solenoid, increasing the number of turns in the coil, decreasing the length of the coil, and adding an iron core to the solenoid."
const MAX_LENGTH = 2500
const formatTranscript = (input: string): string => {
  let transcript = ""
  if (input.length > 8000) {
    //shortern to 8000
    transcript = input.substring(0, MAX_LENGTH);
  }
  else {
    transcript = input;
  }
  const prompt = `${INSTRUCTIONS}${SAMPLE_TRANSCRIPT}\n#END TRANSCRIPT\nSummary:${SAMPLE_SUMMARY}#END SUMMARY\n${transcript}\n#END TRANSCRIPT\nSummary:`;
  return prompt;
};


function extractYoutubeId(url: string): string {
  const pattern = /(?:https?:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/(?:watch|v|embed)(?:\.php)?(?:\?.*v=|\/))([a-zA-Z0-9_-]+)/;
  const result = pattern.exec(url);

  if (!result) {
    return ""; // Return an empty string or any other default value you prefer
  }

  return result[1];
}

// You can write data to the database via a mutation:
export const addVideo = mutation({
  // Validators for arguments.
  args: {
    video_url: v.string(),
    video_transcript: v.string(),
    video_analysis: v.string()
  },

  // Mutation implementation.
  handler: async (ctx, args) => {
    //// Insert or modify documents in the database here.
    //// Mutations can also read from the database like queries.
    //// See https://docs.convex.dev/database/writing-data.

    //const transcript = fetchTranscriptData(ActionCtx(ctx), {videoURL: args.video_url})

    const id = await ctx.db.insert("yt_videos", 
    { video_url: args.video_url, 
      video_transcript: args.video_transcript, 
      video_analysis: args.video_analysis});


    console.log("Added new video with id:", id);
    // Optionally, return a value from your mutation.
    // return id;
  },
});

export const extractTranscript = action({
  // Validators for arguments.
  args: {
    video_url: v.string(),
  },

  // Mutation implementation.
  handler: async (ctx, args) => {
    //// Insert or modify documents in the database here.
    //// Mutations can also read from the database like queries.
    //// See https://docs.convex.dev/database/writing-data.

    //From URL -> Transcript
    const transcript = await ctx.runAction(api.myActions.fetchTranscriptData, {videoURL: args.video_url})
    //Transcript -> Manuj AI -> Analysis
    let analysis = ""
    analysis = await ctx.runAction(api.myActions.fetchAnalysis, {prompt: formatTranscript(transcript)})

    //URL -> Regex -> ID
    const yt_id = extractYoutubeId(args.video_url)
    //Sending to Banyar's DB
    await ctx.runAction(api.myActions.uploadToVectara, {id: yt_id, summary: analysis})

    //convert analysis string to txt file
    //api call to upload txt file to vectara
    //purge text file (not required)
    console.log("Working!")
    //const id = await ctx.db.query();
    await ctx.runMutation(api.myFunctions.addVideo, {
      video_url: args.video_url,
      video_transcript: transcript,
      video_analysis: analysis
    });
    console.log("Finished!")
    return analysis;
  },
});

export const showAnalysis = query({
  args: {
    // video_url: v.string()
  },
  handler: async (ctx, args) => {
    console.log("Now handling showAnalysis function.")
    console.log(ctx.db.query("yt_videos").collect())
    return "beep"
    // Assuming "video_url" is the field you want to use for the query.
    // const video = await ctx.db
    //   .query("yt_videos")
      // .filter((q) => q.eq(q.field("video_url"), args.video_url))
    //   .collect();
    // console.log(video);
    // if (!video) {
    //   return null;
    // }
    // return video[0];
  },
});




// You can read data from the database via a query:
/*export const listNumbers = query({
  // Validators for arguments.
  args: {
    count: v.number(),
  },

  // Query implementation.
  handler: async (ctx, args) => {
    //// Read the database as many times as you need here.
    //// See https://docs.convex.dev/database/reading-data.
    const numbers = await ctx.db.query("numbers").take(args.count);
    return {
      viewer: (await ctx.auth.getUserIdentity())?.name,
      numbers: numbers.map((number) => number.value),
    };
  },
});

// You can write data to the database via a mutation:
export const addNumber = mutation({
  // Validators for arguments.
  args: {
    value: v.number(),
  },

  // Mutation implementation.
  handler: async (ctx, args) => {
    //// Insert or modify documents in the database here.
    //// Mutations can also read from the database like queries.
    //// See https://docs.convex.dev/database/writing-data.

    const id = await ctx.db.insert("numbers", { value: args.value });

    console.log("Added new document with id:", id);
    // Optionally, return a value from your mutation.
    // return id;
  },
});

// You can fetch data from and send data to third-party APIs via an action:
export const myAction = action({
  // Validators for arguments.
  args: {
    first: v.number(),
    second: v.string(),
  },

  // Action implementation.
  handler: async (ctx, args) => {
    //// Use the browser-like `fetch` API to send HTTP requests.
    //// See https://docs.convex.dev/functions/actions#calling-third-party-apis-and-using-npm-packages.
    // const response = await ctx.fetch("https://api.thirdpartyservice.com");
    // const data = await response.json();

    //// Query data by running Convex queries.
    const data = await ctx.runQuery(api.myFunctions.listNumbers, {
      count: 10,
    });
    console.log(data);

    //// Write data by running Convex mutations.
    await ctx.runMutation(api.myFunctions.addNumber, {
      value: args.first,
    });
  },
});*/
