-- CreateEnum
CREATE TYPE "GenerationTaskStatus" AS ENUM ('PENDING', 'PROCESSING', 'GENERATING_VOICE', 'GENERATING_VIDEO', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "GenerationType" AS ENUM ('AUDIO', 'VIDEO');

-- CreateTable
CREATE TABLE "avatars" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "voice_id" TEXT NOT NULL,
    "video_url" TEXT,
    "audio_url" TEXT,
    "text_template" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "avatars_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "generation_tasks" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "avatar_id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "type" "GenerationType" NOT NULL DEFAULT 'VIDEO',
    "status" "GenerationTaskStatus" NOT NULL DEFAULT 'PENDING',
    "audio_url" TEXT,
    "video_url" TEXT,
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "generation_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_limits" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "audio" INTEGER NOT NULL DEFAULT 5,
    "video" INTEGER NOT NULL DEFAULT 3,

    CONSTRAINT "user_limits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_limits_user_id_key" ON "user_limits"("user_id");

-- AddForeignKey
ALTER TABLE "generation_tasks" ADD CONSTRAINT "generation_tasks_avatar_id_fkey" FOREIGN KEY ("avatar_id") REFERENCES "avatars"("id") ON DELETE CASCADE ON UPDATE CASCADE;
