-- CreateTable
CREATE TABLE "Hashtag" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Hashtag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HashtagsOnPosts" (
  "postId" TEXT NOT NULL,
  "hashtagId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "HashtagsOnPosts_pkey" PRIMARY KEY ("postId","hashtagId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Hashtag_name_key" ON "Hashtag"("name");

-- CreateIndex
CREATE INDEX "HashtagsOnPosts_hashtagId_idx" ON "HashtagsOnPosts"("hashtagId");

-- CreateIndex
CREATE INDEX "HashtagsOnPosts_postId_idx" ON "HashtagsOnPosts"("postId");

-- AddForeignKey
ALTER TABLE "HashtagsOnPosts" ADD CONSTRAINT "HashtagsOnPosts_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HashtagsOnPosts" ADD CONSTRAINT "HashtagsOnPosts_hashtagId_fkey" FOREIGN KEY ("hashtagId") REFERENCES "Hashtag"("id") ON DELETE CASCADE ON UPDATE CASCADE; 