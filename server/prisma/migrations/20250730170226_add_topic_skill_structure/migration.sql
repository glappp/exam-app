-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL,
    "labelTh" TEXT NOT NULL,
    "labelEn" TEXT NOT NULL,
    "grade" TEXT NOT NULL,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" TEXT NOT NULL,
    "labelTh" TEXT NOT NULL,
    "labelEn" TEXT NOT NULL,
    "grade" TEXT,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopicSkill" (
    "id" SERIAL NOT NULL,
    "topicId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,

    CONSTRAINT "TopicSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trap" (
    "id" TEXT NOT NULL,
    "labelTh" TEXT NOT NULL,
    "labelEn" TEXT NOT NULL,

    CONSTRAINT "Trap_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TopicSkill_topicId_skillId_key" ON "TopicSkill"("topicId", "skillId");

-- AddForeignKey
ALTER TABLE "TopicSkill" ADD CONSTRAINT "TopicSkill_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicSkill" ADD CONSTRAINT "TopicSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
