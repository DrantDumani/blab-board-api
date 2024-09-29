/*
  Warnings:

  - You are about to drop the `Members` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Members" DROP CONSTRAINT "Members_board_id_fkey";

-- DropTable
DROP TABLE "Members";

-- CreateTable
CREATE TABLE "_BoardMember" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_BoardMember_AB_unique" ON "_BoardMember"("A", "B");

-- CreateIndex
CREATE INDEX "_BoardMember_B_index" ON "_BoardMember"("B");

-- AddForeignKey
ALTER TABLE "_BoardMember" ADD CONSTRAINT "_BoardMember_A_fkey" FOREIGN KEY ("A") REFERENCES "Boards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BoardMember" ADD CONSTRAINT "_BoardMember_B_fkey" FOREIGN KEY ("B") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
