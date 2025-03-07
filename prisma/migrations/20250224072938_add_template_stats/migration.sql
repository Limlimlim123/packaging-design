-- CreateTable
CREATE TABLE "TemplateStats" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TemplateStats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TemplateStats_templateId_key" ON "TemplateStats"("templateId");

-- CreateIndex
CREATE INDEX "TemplateStats_templateId_idx" ON "TemplateStats"("templateId");

-- AddForeignKey
ALTER TABLE "TemplateStats" ADD CONSTRAINT "TemplateStats_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE CASCADE ON UPDATE CASCADE;
