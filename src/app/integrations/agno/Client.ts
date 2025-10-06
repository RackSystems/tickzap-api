
import axios, {AxiosInstance} from 'axios';
import HttpException from "../../exceptions/HttpException";

export class AgnoAiClient {
    private client: AxiosInstance;
    constructor() {
        const agnoConfig = {
            base_url: process.env.AGNO_BASE_URL,
            token: process.env.AGNO_TOKEN,
        };

        if (!agnoConfig.token || !agnoConfig.base_url) {
            throw new HttpException('Configuração inválida para a API Ultron.', 400);
        }

        this.client = axios.create({
            baseURL: agnoConfig.base_url,
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: `Bearer ${agnoConfig.token}`,
            },
            timeout: 180000,
        });
    }

    /**
     * Faz uma requisição à API Ultron
     * @param {string} method - GET, POST, PUT, PATCH, DELETE
     * @param {string} endpoint - Caminho do endpoint
     * @param {object} data - Parâmetros da requisição
     */
    async fetch(method: string, endpoint: string, data = {}): Promise<any> {
        try {
            const config: { data?: any; params?: any } = {};
            const upperMethod = method.toUpperCase();

            switch (upperMethod) {
                case 'POST':
                case 'PUT':
                case 'PATCH':
                    config.data = data; // body JSON
                    break;
                default:
                    config.params = data; // query string
                    break;
            }

            const response = await this.client.request({
                method,
                url: endpoint,
                ...config,
            });

            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message
                || error.response?.data
                || error.message
                || 'Erro desconhecido ao conectar com a API';

            const statusCode = error.response?.status || 500;

            throw new HttpException(
                `Erro ao conectar com a API: ${errorMessage}`,
                statusCode
            );
        }

    }
}
