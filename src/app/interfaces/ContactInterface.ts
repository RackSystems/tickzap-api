export interface Contact {
  id: string;
  name: string;
  email?: string;
  phone: string;
  avatar?: string;
  birthDate?: Date;
  document?: string;
  status: boolean;
  remoteJid?: string;
  channelId?: string;
}