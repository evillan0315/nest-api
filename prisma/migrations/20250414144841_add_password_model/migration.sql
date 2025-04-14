/*
  Warnings:

  - The primary key for the `Account` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Session` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Changed the type of `sender` on the `Message` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - The required column `id` was added to the `VerificationToken` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "Account" DROP CONSTRAINT "Account_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Account_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Account_id_seq";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "sender",
ADD COLUMN     "sender" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Session" DROP CONSTRAINT "Session_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Session_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Session_id_seq";

-- AlterTable
ALTER TABLE "VerificationToken" ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "Password" (
    "id" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Password_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Snippet" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "code" JSONB NOT NULL,
    "language" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Snippet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DatabaseConnection" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "host" TEXT,
    "port" INTEGER,
    "username" TEXT,
    "password" TEXT,
    "databaseName" TEXT,
    "connectionString" TEXT,
    "default" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "DatabaseConnection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Password_userId_key" ON "Password"("userId");

-- AddForeignKey
ALTER TABLE "Password" ADD CONSTRAINT "Password_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Snippet" ADD CONSTRAINT "Snippet_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DatabaseConnection" ADD CONSTRAINT "DatabaseConnection_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
