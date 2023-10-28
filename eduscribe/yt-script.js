import { YoutubeTranscript } from 'youtube-transcript';

async function fetchTranscriptData(videoUrl) {
  try {
    const transcriptData = await YoutubeTranscript.fetchTranscript(videoUrl);
    const transcriptText = mergeTextAndRemoveNewlines(transcriptData);
    return transcriptText;
  } catch (error) {
    console.error('Error fetching transcript:', error);
    throw error;
  }
}

function mergeTextAndRemoveNewlines(data) {
  let mergedText = '';
  for (let i = 0; i < data.length; i++) {
    const cleanedText = data[i].text.replace(/\n/g, '').trim();
    mergedText += cleanedText + ' ';
  }
  return mergedText.trim();
}

export { fetchTranscriptData }


