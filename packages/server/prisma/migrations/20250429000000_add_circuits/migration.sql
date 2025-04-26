-- CreateTable
CREATE TABLE "Circuit" (
  "id" TEXT NOT NULL,
  "ownerId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "isAlgo" BOOLEAN NOT NULL DEFAULT false,
  "query" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Circuit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CircuitPost" (
  "circuitId" TEXT NOT NULL,
  "postId" TEXT NOT NULL,
  "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "CircuitPost_pkey" PRIMARY KEY ("circuitId","postId")
);

-- CreateTable
CREATE TABLE "CircuitFollow" (
  "circuitId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "CircuitFollow_pkey" PRIMARY KEY ("circuitId","userId")
);

-- CreateIndex
CREATE INDEX "CircuitPost_circuitId_idx" ON "CircuitPost"("circuitId");

-- CreateIndex
CREATE INDEX "CircuitPost_postId_idx" ON "CircuitPost"("postId");

-- CreateIndex
CREATE INDEX "CircuitFollow_circuitId_idx" ON "CircuitFollow"("circuitId");

-- CreateIndex
CREATE INDEX "CircuitFollow_userId_idx" ON "CircuitFollow"("userId");

-- AddForeignKey
ALTER TABLE "Circuit" ADD CONSTRAINT "Circuit_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CircuitPost" ADD CONSTRAINT "CircuitPost_circuitId_fkey" FOREIGN KEY ("circuitId") REFERENCES "Circuit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CircuitPost" ADD CONSTRAINT "CircuitPost_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CircuitFollow" ADD CONSTRAINT "CircuitFollow_circuitId_fkey" FOREIGN KEY ("circuitId") REFERENCES "Circuit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CircuitFollow" ADD CONSTRAINT "CircuitFollow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE; 