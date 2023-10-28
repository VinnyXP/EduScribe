"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { YoutubeTranscript } from 'youtube-transcript';



function mergeTextAndRemoveNewlines(data: any) {
    let mergedText = '';
    for (let i = 0; i < data.length; i++) {
      const cleanedText = data[i].text.replace(/\n/g, '').trim();
      mergedText += cleanedText + ' ';
    }
    return mergedText.trim();
}

export const fetchTranscriptData = action({
  args: {
    videoURL: v.string()
  },
  handler: async (_, args) => {
      {
        try {
          const transcriptData = await YoutubeTranscript.fetchTranscript(args.videoURL);
          const transcriptText = await mergeTextAndRemoveNewlines(transcriptData);
          return transcriptText;
        } catch (error) {
          console.error('Error fetching transcript:', error);
          throw error;
        }
      } 
  },
});