-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "useAI" BOOLEAN DEFAULT true;

-- CreateTable
CREATE TABLE "Agent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "communication_style" TEXT NOT NULL,
    "behavior" TEXT,
    "purpose" TEXT,
    "company_support" TEXT,
    "company_description" TEXT,
    "ai_provider" TEXT,
    "ai_model" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agent_pkey" PRIMARY KEY ("id")
);
