import { Channel, Prisma } from "@prisma/client";
import Instance from "../integrations/evolution/Instance";
import prisma from "../../config/database";

type IndexQueryParams = {
  type?: string;
  status?: string;
  isAuthenticated?: string;
  page?: string;
  pageSize?: string;
};

export default {
  async store(data: Channel): Promise<Channel> {
    const payload = {
      instanceName: data.name,
      integration: "WHATSAPP-BAILEYS",
    };

    /* eslint-disable */
    const response: any = await Instance.create(payload);

    if (!response || !response.instance) {
      throw new Error("Failed to create channel in Evolution");
    }

    await this.setWebhook(response.instance.instanceName);

    const channelData = {
      ...data,
      status: response.instance.status,
      identifier: response.instance.instanceId,
      name: response.instance.instanceName,
    };

    return prisma.channel.create({ data: channelData });
  },

  async destroy(id: string): Promise<Channel> {
    const channel = await this.show({ id });

    if (!channel) {
      throw new Error("Channel not found");
    }

    if (channel.status === "open") {
      await Instance.logout(channel.name);
    }

    await Instance.destroy(channel.name);

    return prisma.channel.delete({
      where: { id },
    });
  },

  async index(queryParams: IndexQueryParams): Promise<Channel[]> {
    const where: Prisma.ChannelWhereInput = {};

    if (queryParams.type) {
      where.name = { contains: queryParams.type, mode: "insensitive" };
    }

    if (queryParams.status) {
      where.status = { contains: queryParams.status, mode: "insensitive" };
    }

    return prisma.channel.findMany({
      where,
    });
  },

  async show(filter: Prisma.ChannelWhereUniqueInput): Promise<Channel | null> {
    return prisma.channel.findUnique({
      where: filter,
    });
  },

  async update(id: string, data: Partial<Channel>): Promise<Channel> {
    return prisma.channel.update({
      where: { id },
      data,
    });
  },

  async connect(instanceId: string): Promise<any> {
    const channel = await this.show({ id: instanceId });

    if (!channel) {
      throw new Error("Channel not found");
    }

    const evolutionResponse = await Instance.connect(channel.name);

    if (!evolutionResponse) {
      throw new Error("Failed to retrieve QR code from Evolution");
    }

    return evolutionResponse;
  },

  async getStatus(instanceId: string): Promise<any> {
    const channel = await this.show({ id: instanceId });

    if (!channel) {
      throw new Error("Channel not found");
    }

    const evolutionResponse = await Instance.getStatus(channel.name);

    if (!evolutionResponse) {
      throw new Error("Failed to retrieve Status from Evolution");
    }

    return evolutionResponse;
  },

  async setWebhook(instanceName: string): Promise<any> {
    const webhookUrl = process.env.WEBHOOK_URL;

    if (!webhookUrl) {
      throw new Error("WEBHOOK_URL environment variable is not configured");
    }

    const data = {
      webhook: {
        enabled: true,
        url: webhookUrl,
        webhookByEvents: false,
        base64: true,
        events: [
          "APPLICATION_STARTUP",
          "QRCODE_UPDATED",
          "MESSAGES_SET",
          "MESSAGES_UPSERT",
          "MESSAGES_UPDATE",
          "MESSAGES_DELETE",
          "SEND_MESSAGE",
          "CONTACTS_SET",
          "CONTACTS_UPSERT",
          "CONTACTS_UPDATE",
          "PRESENCE_UPDATE",
          "CHATS_SET",
          "CHATS_UPSERT",
          "CHATS_UPDATE",
          "CHATS_DELETE",
          "GROUPS_UPSERT",
          "GROUP_UPDATE",
          "GROUP_PARTICIPANTS_UPDATE",
          "CONNECTION_UPDATE",
          "LABELS_EDIT",
          "LABELS_ASSOCIATION",
          "CALL",
          "TYPEBOT_START",
          "TYPEBOT_CHANGE_STATUS",
        ],
      },
    };

    return await Instance.setWebhook(instanceName, data);
  },

  async logout(instanceId: string) {
    const channel = await this.show({ id: instanceId });

    if (!channel) {
      throw new Error("Channel not found");
    }

    const evolutionResponse = await Instance.logout(channel.name);

    if (!evolutionResponse) {
      throw new Error("Failed to logout from Evolution");
    }

    return evolutionResponse;
  },
};
