/*
  Warnings:

  - You are about to alter the column `about` on the `Users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(200)`.

*/
-- AlterTable
ALTER TABLE "Users" ALTER COLUMN "about" SET DATA TYPE VARCHAR(200);
