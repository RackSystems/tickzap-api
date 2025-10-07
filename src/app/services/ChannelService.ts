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
    const evolutionResponse: any = await Instance.create(payload);

    if (!evolutionResponse || !evolutionResponse.instance.status || !evolutionResponse.hash) {
      throw new Error("Failed to create channel in Evolution");
    }

    await this.setWebhook(evolutionResponse.instance.instanceName);

    const channelData = {
      ...data,
      status: evolutionResponse.instance.status,
      identifier: evolutionResponse.hash,
    };

    return prisma.channel.create({ data: channelData });
  },

  async destroy(id: string): Promise<Channel> {
    const channel = await this.show({ id });

    if (!channel) {
      throw new Error("Channel not found");
    }

    const statusResponse = await this.getStatus(id);
    // Check various possible status values that indicate connection
    const isConnected =
      statusResponse &&
      (statusResponse.instance?.connectionStatus === "open" ||
        statusResponse.instance?.status === "open" ||
        statusResponse.connectionStatus === "open" ||
        statusResponse.status === "open" ||
        statusResponse.instance?.state === "open");

    if (isConnected) {
      await this.logout(id);
    }

    // Delete the instance from Evolution
    try {
      await Instance.destroy(channel.name);
    } catch (error) {
      console.error("Error deleting instance from Evolution:", error);
      // Continue with database deletion even if Evolution deletion fails
    }

    // Delete from database
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
