/*
  Warnings:

  - You are about to drop the column `can_invite` on the `Boards` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Boards" DROP COLUMN "can_invite",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
