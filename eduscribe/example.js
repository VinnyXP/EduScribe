import axios from "axios";

async function makeInferenceRequest(prompt) {
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
    stop: '#end',
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
async function main() {
    const prompt = 'The capital of France is';
    const response = await makeInferenceRequest(prompt);
    console.log(response);
}
main();