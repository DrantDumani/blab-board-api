-- CreateEnum
CREATE TYPE "board_type" AS ENUM ('public', 'private');

-- CreateEnum
CREATE TYPE "post_type" AS ENUM ('text', 'image');

-- CreateEnum
CREATE TYPE "f_status" AS ENUM ('pending', 'accepted');

-- CreateTable
CREATE TABLE "Users" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(20) NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "pw" TEXT NOT NULL,
    "about" TEXT NOT NULL DEFAULT '',
    "pfp" TEXT NOT NULL DEFAULT '',
    "pfp_id" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Boards" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(20) NOT NULL,
    "type" "board_type" NOT NULL DEFAULT 'public',
    "imgurl" TEXT NOT NULL DEFAULT '',
    "img_id" TEXT NOT NULL DEFAULT '',
    "can_invite" BOOLEAN NOT NULL DEFAULT true,
    "creator_id" INTEGER NOT NULL,

    CONSTRAINT "Boards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Posts" (
    "id" SERIAL NOT NULL,
    "author_id" INTEGER NOT NULL,
    "text" VARCHAR(500) NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "board_id" INTEGER NOT NULL,
    "is_edited" BOOLEAN NOT NULL DEFAULT false,
    "type" "post_type" NOT NULL DEFAULT 'text',

    CONSTRAINT "Posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Members" (
    "board_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "date_joined" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Members_pkey" PRIMARY KEY ("board_id","user_id")
);

-- CreateTable
CREATE TABLE "Friends" (
    "user_id" INTEGER NOT NULL,
    "friend_id" INTEGER NOT NULL,
    "status" "f_status" NOT NULL DEFAULT 'pending',

    CONSTRAINT "Friends_pkey" PRIMARY KEY ("user_id","friend_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_username_key" ON "Users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- AddForeignKey
ALTER TABLE "Boards" ADD CONSTRAINT "Boards_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Posts" ADD CONSTRAINT "Posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Posts" ADD CONSTRAINT "Posts_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "Boards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Members" ADD CONSTRAINT "Members_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "Boards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friends" ADD CONSTRAINT "Friends_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friends" ADD CONSTRAINT "Friends_friend_id_fkey" FOREIGN KEY ("friend_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
