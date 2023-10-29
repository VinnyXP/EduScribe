"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { YoutubeTranscript } from 'youtube-transcript';
import axios from 'axios';
import FormData from 'form-data'
import fs  from 'fs';
import path from 'path';
import os from 'os';

function mergeTextAndRemoveNewlines(data: any) {
    let mergedText = '';
    for (let i = 0; i < data.length; i++) {
      const cleanedText = data[i].text.replace(/\n/g, '').trim();
      mergedText += cleanedText + ' ';
    }
    return mergedText.trim();
}

async function makeInferenceRequest(prompt: string) {
    const url = 'https://api.together.xyz/inference';
    const headers = {
      'Authorization': 'Bearer 1de82afc6c4006d7f4651f636948c150baf842321d4d7d11538ec8f8cd056ad4',
      'accept': 'application/json',
      'content-type': 'application/json',
    };
    const data = {
      model: 'crowds.errors-0v@icloud.com/llama-2-13b-2023-10-28-22-37-36',
      prompt,
      max_tokens: 128,
      stop: '#END',
      temperature: 0.7,
      top_p: 0.7,
      top_k: 50,
      repetition_penalty: 1.3,
    };
  
    try {
        const response = await axios.post(url, data, { headers });
        return response.data;
    } catch (error) {
      console.error('Error making inference request:', error);
      throw error;
    }
  }

// Need to define get_video_title(id) if not done so already
async function get_video_title(id: string) {
  const url = `https://www.googleapis.com/youtube/v3/videos?id=${id}&key=AIzaSyC0NGaAvLyxdDsQfC1fDH3DcHQv3Ei_HsE&part=snippet`;

  try {
    const response = await fetch(url);
    if (response.status === 200) {
      const data = await response.json();
      return data.items[0].snippet.title;
    } else {
      throw new Error('Failed to fetch data');
    }
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

export const uploadToVectara = action({
  args: {
    id: v.string(), 
    summary: v.string()
  },
  handler: async(_, args) => {
      // Create a temporary file and write the string to it
    const tempFilePath = path.join(os.tmpdir(), args.id + ".txt")
    fs.writeFileSync(tempFilePath, args.summary);
    let data = new FormData();
    const url = `https://www.youtube.com/watch?v=${args.id}`
    const title = await get_video_title(args.id)
    data.append('doc_metadata', `{"title": "${title}", "url": "${url}"}`)
    data.append('file', fs.createReadStream(tempFilePath)) // read the temporary file
    let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: `https://api.vectara.io/v1/upload?c=1040011825&o=3`,
    headers: {
        'Content-Type': 'multipart/form-data', 
        'Accept': 'application/json', 
        'x-api-key': "zwt_Pf1SMSG6FQ03wjwelDk8RP2hvWXBkHGKzcAOTA", 
        ...data.getHeaders()
    },
    data : data
    };

    await axios(config)
    .then((response) => {
    console.log(JSON.stringify(response.data));
    })
    .catch((error) => {
    console.log(error);
    });
  }
})

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


export const fetchAnalysis = action({
    args: {
        prompt: v.string()
    },
    handler: async (_, args) => {
        const response = await makeInferenceRequest(args.prompt);
        if (response === null) {
            console.log('Error!');
            return null;
        }
        else {
            try {
                const text = response.output.choices[0].text;
                if (text) {
                    console.log(`Response: ${text}`);
                    return text;
                }
                else {
                    console.log('Error! Response text is null!');
                    return null;
                }
            }
            catch (error) {
                console.log('Error! Could not extract text from response!');
                return null;
            }
        }
    }
})