interface WebhookPayload {
  event: string;
  instance: string;
  data: any;
  destination: string;
  date_time: string;
  sender: string;
  server_url: string;
  apikey: string;
}

export interface EvolutionInstanceResponse {
  instance: {
    instanceName: string;
    status: string;
  };
  hash: {
    apikey: string;
  };
}
