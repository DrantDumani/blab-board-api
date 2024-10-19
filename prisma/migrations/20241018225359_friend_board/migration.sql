-- AlterTable
ALTER TABLE "Friends" ADD COLUMN     "board_id" INTEGER;

-- AddForeignKey
ALTER TABLE "Friends" ADD CONSTRAINT "Friends_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "Boards"("id") ON DELETE CASCADE ON UPDATE CASCADE;
