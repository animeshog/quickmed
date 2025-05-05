import axios from 'axios';

export async function listModels(apiKey: string) {
  try {
    const response = await axios.get(
      `https://generativelanguage.googleapis.com/v1/models`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        params: {
          key: apiKey
        }
      }
    );
    return response.data.models;
  } catch (error) {
    console.error('Error listing models:', error);
    throw error;
  }
}
