import axios from 'axios'

const client = axios.create({
  baseURL: process.env.EVOLUTION_URL,
  headers: {
    'Content-Type': 'application/json',
    apikey: process.env.EVOLUTION_API_KEY as string,
  }
})

client.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      console.error('API Error Response:');
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('No response received. Request:', error.request);
    } else {
      console.error('Error setting up the request:', error.message);
    }

    return Promise.reject(error);
  }
);

export default client
