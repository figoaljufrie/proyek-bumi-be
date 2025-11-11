/*
  Warnings:

  - You are about to drop the column `password_hash` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "password_hash",
ADD COLUMN     "deleted_at" TIMESTAMPTZ,
ADD COLUMN     "password" VARCHAR(255),
ALTER COLUMN "display_name" DROP NOT NULL;
