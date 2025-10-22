import { Agent, Prisma } from "@prisma/client";
import prisma from "../../config/database";
import HttpException from "../exceptions/HttpException";
import AgnoAgent from "../integrations/agno/Agent";

type AgentQuery = {
  name?: string;
  page?: string;
  pageSize?: string;
};

export default {
  async index(queryParams: AgentQuery): Promise<Agent[]> {
    const where: Prisma.AgentWhereInput = {};

    if (queryParams.name) {
      where.name = { contains: queryParams.name, mode: "insensitive" };
    }

    const page = queryParams.page ? parseInt(queryParams.page) : 1;
    const pageSize = queryParams.pageSize ? parseInt(queryParams.pageSize) : 10;

    return prisma.agent.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
  },

  async show(filter: Prisma.AgentWhereUniqueInput): Promise<Agent | null> {
    const agent = await prisma.agent.findUnique({
      where: filter,
    });

    if (!agent) {
      throw new HttpException("Agent not found", 404);
    }

    return agent;
  },

  async store(data: Prisma.AgentCreateInput): Promise<Agent> {
    return prisma.agent.create({ data });
  },

  async update(id: string, data: Prisma.AgentUpdateInput): Promise<Agent> {
    await this.show({ id }); // a checagem de existencia do agente eh feita aqui
    return prisma.agent.update({
      where: { id },
      data,
    });
  },

  async destroy(id: string): Promise<Agent> {
    await this.show({ id }); // a checagem de existencia do agente eh feita aqui
    return prisma.agent.delete({
      where: { id },
    });
  },

  async use(id: string, payload: { message: string; session_id: string; user_id: string }) {
    await this.show({ id });
    return AgnoAgent.useAgent(id, payload);
  },
};
