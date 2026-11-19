const STORAGE_KEY = 'mindmint-local-profile-v1'

export const defaultProfile = {
  xp: 240,
  streak: 7,
  lastPlayedDate: null,
  totalPlayTimeMinutes: 24,
  sessions: [],
  bests: {},
}

function isSameDay(first, second) {
  return first && second && first.slice(0, 10) === second.slice(0, 10)
}

function isYesterday(dateString) {
  if (!dateString) return false
  const date = new Date(`${dateString.slice(0, 10)}T12:00:00`)
  const yesterday = new Date()
  yesterday.setHours(12, 0, 0, 0)
  yesterday.setDate(yesterday.getDate() - 1)
  return date.toDateString() === yesterday.toDateString()
}

export function loadProfile() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (!stored || typeof stored !== 'object') return defaultProfile
    return { ...defaultProfile, ...stored, sessions: Array.isArray(stored.sessions) ? stored.sessions : [], bests: stored.bests || {} }
  } catch {
    return defaultProfile
  }
}

export function saveProfile(profile) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
}

export function recordSession(profile, session) {
  const now = new Date()
  const today = now.toISOString()
  const wasPlayedToday = isSameDay(profile.lastPlayedDate, today)
  let streak = profile.streak

  if (!wasPlayedToday) {
    streak = isYesterday(profile.lastPlayedDate) ? profile.streak + 1 : 1
  }

  const oldBest = profile.bests[session.gameId]
  const isBetter = session.lowerIsBetter
    ? oldBest == null || session.score < oldBest
    : oldBest == null || session.score > oldBest

  return {
    ...profile,
    xp: profile.xp + session.xp,
    streak,
    lastPlayedDate: today,
    totalPlayTimeMinutes: profile.totalPlayTimeMinutes + (session.durationMinutes || 1),
    sessions: [{ ...session, id: crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`, date: today }, ...profile.sessions].slice(0, 100),
    bests: isBetter ? { ...profile.bests, [session.gameId]: session.score } : profile.bests,
  }
}

export function clearProfile() {
  localStorage.removeItem(STORAGE_KEY)
}
