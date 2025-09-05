import client from './Client';

interface TextPayload {
  text: string;
  number: string;
}

interface AudioPayload {
  audio: string;
  number: string;
}

interface MediaPayload {
  media: string
  type: string
  mediaType: string;
  number: string;
}

const mimeTypes: Record<string, 'document' | 'image' | 'audio' | 'video'> = {
  pdf: 'document',
  jpg: 'image',
  png: 'image',
  gif: 'image',
  mp3: 'audio',
  ogg: 'audio',
  mp4: 'video',
}

export default {
  async sendText(instance: string, payload: TextPayload) {
    const { data } = await client.post(`/message/sendText/${instance}`, { payload })
    return data
  },

  async sendAudio(instance: string, payload: AudioPayload) {
    const { data } = await client.post(`/message/sendWhatsAppAudio/${instance}`, { payload })
    return data
  },

  async sendMedia(instance: string, payload: MediaPayload){
    const type = mimeTypes[payload.mediaType]

    const payload2 = {
      number: payload.number,
      type: type,
      mediaType: type,
      media: payload.media,
    }

    const { data } = await client.post(`/message/sendMedia/${instance}`, { payload2 })
    return data
  },

  async sendSticker(instance: string, payload: AudioPayload) {
    const { data } = await client.post(`/message/sendSticker/${instance}`, { payload })
    return data
  },

  async markMessageAsRead(instance: string, payload: Object) {
    const { data } = await client.post(`/message/markMessageAsRead/${instance}`, { payload })
    return data
  }
}
