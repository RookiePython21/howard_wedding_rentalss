#!/usr/bin/env node
/**
 * publish-to-firebase.js
 *
 * Publishes a blog article to the Firestore `blog-posts` collection.
 *
 * Usage (pipe JSON):
 *   echo '{"title":"...","content":"..."}' | node publish-to-firebase.js
 *
 * Usage (JSON file path):
 *   node publish-to-firebase.js ./article.json
 *
 * Required fields:  title, content, excerpt
 * Optional fields:  slug (auto-generated from title if omitted),
 *                   author (defaults to "Howard Wedding Rentals"),
 *                   tags (defaults to []),
 *                   coverImage,
 *                   published (defaults to false — set true to go live immediately)
 *
 * Reads Firebase config from the project .env file (VITE_FIREBASE_* vars).
 * Run from the project root so the .env path resolves correctly.
 */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore'

// ── Load .env ──────────────────────────────────────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(__dirname, '../../../..')
dotenv.config({ path: resolve(projectRoot, '.env') })

const required = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
]
const missing = required.filter((k) => !process.env[k])
if (missing.length) {
  console.error(`Missing env vars: ${missing.join(', ')}`)
  console.error(`Make sure .env exists at: ${projectRoot}`)
  process.exit(1)
}

// ── Init Firebase ──────────────────────────────────────────────────────────
const app = initializeApp({
  apiKey:            process.env.VITE_FIREBASE_API_KEY,
  authDomain:        process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.VITE_FIREBASE_APP_ID,
})
const db = getFirestore(app)

// ── Read article data ──────────────────────────────────────────────────────
async function readInput() {
  const arg = process.argv[2]

  if (arg) {
    const filePath = resolve(process.cwd(), arg)
    return JSON.parse(readFileSync(filePath, 'utf8'))
  }

  // Read from stdin
  return new Promise((resolve, reject) => {
    let raw = ''
    process.stdin.setEncoding('utf8')
    process.stdin.on('data', (chunk) => (raw += chunk))
    process.stdin.on('end', () => {
      try { resolve(JSON.parse(raw)) }
      catch (e) { reject(new Error('Invalid JSON from stdin')) }
    })
    process.stdin.on('error', reject)
  })
}

// ── Slug helper ────────────────────────────────────────────────────────────
function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

// ── Validate ───────────────────────────────────────────────────────────────
function validate(data) {
  const errors = []
  if (!data.title?.trim())   errors.push('title is required')
  if (!data.content?.trim()) errors.push('content is required')
  if (!data.excerpt?.trim()) errors.push('excerpt is required')
  return errors
}

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
  let data
  try {
    data = await readInput()
  } catch (e) {
    console.error('Failed to read article data:', e.message)
    process.exit(1)
  }

  const errors = validate(data)
  if (errors.length) {
    console.error('Validation errors:')
    errors.forEach((e) => console.error(`  - ${e}`))
    process.exit(1)
  }

  const doc = {
    title:       data.title.trim(),
    slug:        (data.slug?.trim() || slugify(data.title)).toLowerCase(),
    excerpt:     data.excerpt.trim(),
    content:     data.content.trim(),
    coverImage:  data.coverImage?.trim() ?? '',
    author:      data.author?.trim() || 'Howard Wedding Rentals',
    tags:        Array.isArray(data.tags) ? data.tags : [],
    published:   data.published === true,
    publishedAt: Timestamp.now(),
  }

  console.log('\nPublishing article to Firestore...')
  console.log(`  Title:     ${doc.title}`)
  console.log(`  Slug:      ${doc.slug}`)
  console.log(`  Published: ${doc.published}`)
  console.log(`  Tags:      ${doc.tags.join(', ') || '(none)'}`)

  try {
    const ref = await addDoc(collection(db, 'blog-posts'), doc)
    console.log(`\n✓ Article saved — document ID: ${ref.id}`)
    console.log(`  URL: /blog/${doc.slug}`)
    if (!doc.published) {
      console.log('\n  Note: published is false — set it to true in Firebase to go live.')
    }
  } catch (e) {
    console.error('\nFirestore write failed:', e.message)
    process.exit(1)
  }
}

main()
