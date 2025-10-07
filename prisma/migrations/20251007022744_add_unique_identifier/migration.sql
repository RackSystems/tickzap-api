/*
  Warnings:

  - A unique constraint covering the columns `[identifier]` on the table `Channel` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Channel_identifier_key" ON "Channel"("identifier");
