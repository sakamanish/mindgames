const DB_NAME = 'mindmint-db'
const DB_VERSION = 1

export const defaultProfile = {
  version: 1,
  xp: 0,
  unlockedAchievements: [],
  achievementsHistory: [],
  streak: 0,
  longestStreak: 0,
  activeDays: [],
  lastActiveDate: null,
  totalPlayTimeSeconds: 0,
  sessions: [],
  games: {},
  daily: {},
  favorites: [],
  settings: { sound: true, haptics: true, reducedMotion: false },
}

function localDate(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function openDb() {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) return reject(new Error('IndexedDB unavailable'))
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains('profile')) db.createObjectStore('profile', { keyPath: 'id' })
      if (!db.objectStoreNames.contains('sessions')) db.createObjectStore('sessions', { keyPath: 'id' })
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function getProfileFallback() {
  try {
    const raw = localStorage.getItem('mindmint-profile-v1')
    return raw ? integrityMerge(JSON.parse(raw)) : structuredClone(defaultProfile)
  } catch {
    return structuredClone(defaultProfile)
  }
}

function integrityMerge(value) {
  if (!value || typeof value !== 'object') return structuredClone(defaultProfile)
  return {
    ...structuredClone(defaultProfile),
    ...value,
    sessions: Array.isArray(value.sessions) ? value.sessions.slice(0, 1000) : [],
    activeDays: Array.isArray(value.activeDays) ? value.activeDays : [],
    games: value.games && typeof value.games === 'object' ? value.games : {},
    daily: value.daily && typeof value.daily === 'object' ? value.daily : {},
    achievementsHistory: Array.isArray(value.achievementsHistory) ? value.achievementsHistory : [],
  }
}

export async function loadProfile() {
  try {
    const db = await openDb()
    const profile = await new Promise((resolve, reject) => {
      const transaction = db.transaction('profile', 'readonly')
      const request = transaction.objectStore('profile').get('player')
      request.onsuccess = () => resolve(request.result?.data)
      request.onerror = () => reject(request.error)
    })
    db.close()
    if (profile) return integrityMerge(profile)
  } catch (error) {
    console.warn('IndexedDB unavailable; using fallback storage', error)
  }
  return getProfileFallback()
}

export async function saveProfile(profile) {
  const safe = integrityMerge(profile)
  try {
    const db = await openDb()
    await new Promise((resolve, reject) => {
      const transaction = db.transaction('profile', 'readwrite')
      transaction.objectStore('profile').put({ id: 'player', data: safe })
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
    db.close()
  } catch (error) {
    console.warn('Profile save failed in IndexedDB', error)
  }
  localStorage.setItem('mindmint-profile-v1', JSON.stringify(safe))
}

export async function clearProfile() {
  try {
    const db = await openDb()
    await new Promise((resolve, reject) => {
      const transaction = db.transaction(['profile', 'sessions'], 'readwrite')
      transaction.objectStore('profile').clear()
      transaction.objectStore('sessions').clear()
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
    db.close()
  } catch (error) {
    console.warn('Could not clear IndexedDB', error)
  }
  localStorage.removeItem('mindmint-profile-v1')
}

export async function exportProfile(profile) {
  const blob = new Blob([JSON.stringify({ app: 'MindMint', exportedAt: new Date().toISOString(), version: 1, profile }, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `mindmint-backup-${localDate()}.json`
  anchor.click()
  URL.revokeObjectURL(url)
}

export async function importProfile(file) {
  const parsed = JSON.parse(await file.text())
  if (parsed.app !== 'MindMint' || !parsed.profile) throw new Error('This is not a valid MindMint backup')
  return integrityMerge(parsed.profile)
}

export function recordSession(profile, result) {
  const today = localDate()
  const activeSet = new Set(profile.activeDays)
  activeSet.add(today)

  let streak = profile.streak
  if (!profile.activeDays.includes(today)) {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    streak = profile.lastActiveDate === localDate(yesterday) ? profile.streak + 1 : 1
  }

  const game = profile.games[result.gameId] || { unlockedLevel: 1, highestLevel: 0, bestScore: null, bestTime: null, attempts: 0, completions: 0, correct: 0, answered: 0, favourite: false }
  const completed = result.accuracy >= 60
  const newHighest = Math.max(game.highestLevel || 0, completed ? result.level : 0)
  const unlockedLevel = Math.min(50, Math.max(game.unlockedLevel || 1, completed ? result.level + 1 : 1))
  const isBetter = result.lowerIsBetter
    ? game.bestScore == null || result.score < game.bestScore
    : game.bestScore == null || result.score > game.bestScore
  const bestScore = isBetter ? result.score : game.bestScore

  const session = {
    id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`,
    date: new Date().toISOString(),
    localDate: today,
    ...result,
  }

  const sessions = [session, ...profile.sessions].slice(0, 1000)
  const xp = profile.xp + (result.xp || 0)
  const longestStreak = Math.max(profile.longestStreak || 0, streak)

  let nextProfile = {
    ...profile,
    xp,
    streak,
    longestStreak,
    lastActiveDate: today,
    activeDays: [...activeSet].sort(),
    totalPlayTimeSeconds: (profile.totalPlayTimeSeconds || 0) + (result.durationSeconds || 60),
    sessions,
    games: {
      ...profile.games,
      [result.gameId]: {
        ...game,
        unlockedLevel,
        highestLevel: newHighest,
        bestScore,
        bestTime: game.bestTime == null ? result.durationSeconds : Math.min(game.bestTime, result.durationSeconds),
        attempts: (game.attempts || 0) + 1,
        completions: (game.completions || 0) + (completed ? 1 : 0),
        correct: (game.correct || 0) + (result.correct || 0),
        answered: (game.answered || 0) + (result.answered || (result.correct || 0) + (result.incorrect || 0)),
      },
    },
  }

  nextProfile = applyAchievements(nextProfile, session)
  return nextProfile
}

function applyAchievements(profile, session) {
  const definitions = [
    ['first-game', 'First Game', 'Complete your first game', 1],
    ['perfect-mind', 'Perfect Mind', 'Finish with 100% accuracy', 25],
    ['dedicated', 'Dedicated Brain', 'Play 100 games', 100],
    ['expert', 'Expert Thinker', 'Complete level 41 or higher', 50],
  ]
  const newlyUnlocked = []
  for (const [id, title, description, reward] of definitions) {
    if (profile.unlockedAchievements.includes(id)) continue
    let unlocked = false
    if (id === 'first-game') unlocked = profile.sessions.length >= 1
    if (id === 'perfect-mind') unlocked = session.accuracy === 100
    if (id === 'dedicated') unlocked = profile.sessions.length >= 100
    if (id === 'expert') unlocked = session.level >= 41
    if (unlocked) {
      newlyUnlocked.push(id)
      profile.unlockedAchievements.push(id)
      profile.achievementsHistory.push({ id, title, description, reward, date: new Date().toISOString() })
      profile.xp += reward
    }
  }
  return profile
}

export function getDifficulty(level) {
  if (level <= 10) return { name: 'Beginner', multiplier: 1 }
  if (level <= 20) return { name: 'Easy', multiplier: 1.15 }
  if (level <= 30) return { name: 'Intermediate', multiplier: 1.35 }
  if (level <= 40) return { name: 'Advanced', multiplier: 1.6 }
  return { name: 'Expert', multiplier: 2 }
}

export function getLocalDateKey(date = new Date()) { return localDate(date) }
