import {AgnoAiClient} from './Client';
import HttpException from "../../exceptions/HttpException";

export default {
    client: new AgnoAiClient(),

    /**
     * Chama o agente diretamente (rota /use)
     * @param {string} message - Texto da mensagem
     * @param {string} sessionId - ID da sessão (whatsapp jid)
     * @returns {Promise<object>}
     */
    async useAgent(message: string, sessionId: string): Promise<object> {
        try {
            const response = await this.client.fetch('POST',"/use", {
                message,
                session_id: sessionId,
            });
            return response.data;
        } catch (error: any) {
            console.error("Erro ao chamar /use:", error.response?.data || error.message);
            throw new HttpException("Falha ao chamar o agente Python");
        }
    },

    /**
     * Envia um webhook manualmente (rota /webhook)
     * Útil para testes locais.
     * @param {object} payload - Corpo completo do evento recebido do WhatsApp
     * @returns {Promise<object>}
     */
    async sendWebhook(payload: any) {
        try {
            const response = await this.client.fetch('POST', "/webhook", payload);
            return response.data;
        } catch (error: any) {
            console.error("Erro ao chamar /webhook:", error.response?.data || error.message);
            throw new HttpException("Falha ao enviar webhook");
        }
    }
}