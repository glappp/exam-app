// File: prisma/migrateData.js

const { PrismaClient } = require('@prisma/client')
const { PrismaClient: SqliteClient } = require('../sqlite-client')

const sqlite = new SqliteClient()
const postgres = new PrismaClient()

async function migrateUsers() {
  const users = await sqlite.user.findMany()
  for (const { id, ...data } of users) {
    await postgres.user.upsert({
      where: { id },
      create: { id, ...data },
      update: data,
    })
  }
  console.log(`✓ Migrated ${users.length} users`)
}

async function migrateStudentProfiles() {
  const profiles = await sqlite.studentProfile.findMany()
  for (const { id, ...data } of profiles) {
    await postgres.studentProfile.upsert({
      where: { id },
      create: { id, ...data },
      update: data,
    })
  }
  console.log(`✓ Migrated ${profiles.length} student profiles`)
}

async function migrateExamResults() {
  const results = await sqlite.examResult.findMany()
  for (const { id, ...data } of results) {
    await postgres.examResult.upsert({
      where: { id },
      create: { id, ...data },
      update: data,
    })
  }
  console.log(`✓ Migrated ${results.length} exam results`)
}

async function migrateQuestions() {
  const questions = await sqlite.question.findMany()
  for (const { id, ...data } of questions) {
    await postgres.question.upsert({
      where: { id },
      create: { id, ...data },
      update: data,
    })
  }
  console.log(`✓ Migrated ${questions.length} questions`)
}

async function migrateResults() {
  const answers = await sqlite.result.findMany()
  for (const { id, ...data } of answers) {
    await postgres.result.upsert({
      where: { id },
      create: { id, ...data },
      update: data,
    })
  }
  console.log(`✓ Migrated ${answers.length} results`)
}

async function migrateExamSetMetadata() {
  const sets = await sqlite.examSetMetadata.findMany()
  for (const { id, ...data } of sets) {
    await postgres.examSetMetadata.upsert({
      where: { id },
      create: { id, ...data },
      update: data,
    })
  }
  console.log(`✓ Migrated ${sets.length} exam set metadata`)
}

async function migrateAttributeDictionary() {
  const dicts = await sqlite.attributeDictionary.findMany()
  for (const { key, ...data } of dicts) {
    await postgres.attributeDictionary.upsert({
      where: { key },
      create: { key, ...data },
      update: data,
    })
  }
  console.log(`✓ Migrated ${dicts.length} attribute dictionary entries`)
}

async function main() {
  await migrateUsers()
  await migrateStudentProfiles()
  await migrateExamResults()
  await migrateQuestions()
  await migrateResults()
  await migrateExamSetMetadata()
  await migrateAttributeDictionary()
}

main()
  .catch((e) => {
    console.error('🚨 Migration error:', e)
  })
  .finally(async () => {
    await sqlite.$disconnect()
    await postgres.$disconnect()
  })
