/*
  Warnings:

  - The values [pending] on the enum `f_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "f_status_new" AS ENUM ('pending_1_2', 'pending_2_1', 'accepted');
ALTER TABLE "Friends" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Friends" ALTER COLUMN "status" TYPE "f_status_new" USING ("status"::text::"f_status_new");
ALTER TYPE "f_status" RENAME TO "f_status_old";
ALTER TYPE "f_status_new" RENAME TO "f_status";
DROP TYPE "f_status_old";
COMMIT;

-- AlterTable
ALTER TABLE "Friends" ALTER COLUMN "status" DROP DEFAULT;
