import admin from 'firebase-admin'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const serviceAccountPath = resolve(__dirname, 'service-account.json')

let serviceAccount
try {
  serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'))
} catch {
  console.error('Missing service-account.json in scripts/ folder.')
  console.error('Download it from Firebase Console → Project Settings → Service accounts → Generate new private key')
  process.exit(1)
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
})

const db = admin.firestore()

const DEFAULT_STATS = {
  totalSolves: 0,
  totalMoves: 0,
  totalRotationDegrees: 0,
  avgSolveTime: null,
  bestSolveTime: null,
  verifiedAvgSolveTime: null,
  verifiedBestSolveTime: null,
  verifiedTotalSolves: 0,
  avgCross: null,
  avgF2L: null,
  avgOLL: null,
  avgPLL: null,
  avgMoves: null,
  ollSkips: 0,
  pllSkips: 0,
  sub20With80Moves: 0,
  perfectMoveMatches: 0,
  godsNumberSolves: 0,
  fullStepSub15: 0,
  crossUnder8Moves: 0,
  f2lNoPause: 0,
  pllUnder4s: 0,
  pllUnder3s: 0,
  pllUnder2s: 0,
  pllUnder1_5s: 0,
  pllUnder1s: 0,
  tpsOver5Solves: 0,
}

const DEFAULT_STREAK = {
  currentStreak: 0,
  longestStreak: 0,
  lastSolveDate: null,
  solvesToday: 0,
  streakMultiplier: 1,
}

async function clearAllAchievements() {
  console.log('Fetching all users...')
  const usersSnapshot = await db.collection('users').get()
  
  if (usersSnapshot.empty) {
    console.log('No users found.')
    process.exit(0)
  }

  console.log(`Found ${usersSnapshot.size} users. Clearing achievements...`)

  const BATCH_SIZE = 500
  let processed = 0

  for (let i = 0; i < usersSnapshot.docs.length; i += BATCH_SIZE) {
    const batch = db.batch()
    const chunk = usersSnapshot.docs.slice(i, i + BATCH_SIZE)

    for (const userDoc of chunk) {
      batch.update(userDoc.ref, {
        achievements: [],
        stats: DEFAULT_STATS,
        streak: DEFAULT_STREAK,
      })
    }

    await batch.commit()
    processed += chunk.length
    console.log(`Processed ${processed}/${usersSnapshot.size} users`)
  }

  console.log('Done! All user achievements have been cleared.')
  process.exit(0)
}

clearAllAchievements().catch((error) => {
  console.error('Error:', error)
  process.exit(1)
})
