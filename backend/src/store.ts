import { Profile, XP_REWARDS, buildTimeline, generateOpportunities, generateSkillTree, getLevelInfo, recommendCareers } from './engine.js'

type UserRecord = {
  id: string
  email: string
  password: string
  profile: Profile
  xp: number
  quests: Array<{ name: string; status: 'active' | 'complete' }>
}

const users = new Map<string, UserRecord>()
const emailToId = new Map<string, string>()

function makeId() {
  return Math.random().toString(36).slice(2, 10)
}

export function signup(email: string, password: string, profile: Profile) {
  if (emailToId.has(email)) throw new Error('Email already exists')
  const id = makeId()
  users.set(id, {
    id,
    email,
    password,
    profile,
    xp: 0,
    quests: [
      { name: 'Complete first lesson', status: 'active' },
      { name: 'Pass first quiz', status: 'active' },
      { name: 'Submit first project', status: 'active' },
    ],
  })
  emailToId.set(email, id)
  return { userId: id, token: `token-${id}` }
}

export function login(email: string, password: string) {
  const id = emailToId.get(email)
  if (!id) throw new Error('User not found')
  const user = users.get(id)
  if (!user || user.password !== password) throw new Error('Invalid credentials')
  return { userId: id, token: `token-${id}` }
}

export function getDashboard(userId: string) {
  const user = users.get(userId)
  if (!user) throw new Error('User not found')
  const careerRecommendations = recommendCareers(user.profile)
  const targetCareer = user.profile.dreamCareer || careerRecommendations[0]?.title || 'AI Engineer'
  const readiness = Math.min(100, Math.round((user.xp / 3000) * 100))

  return {
    user: user.profile.name,
    ...getLevelInfo(user.xp),
    readiness,
    quests: user.quests,
    skillTree: generateSkillTree(targetCareer),
    opportunities: generateOpportunities(user.profile.interests, user.profile.grade),
    careerRecommendations,
    timeline: buildTimeline(targetCareer),
  }
}

export function addXp(userId: string, action: keyof typeof XP_REWARDS) {
  const user = users.get(userId)
  if (!user) throw new Error('User not found')
  user.xp += XP_REWARDS[action]
  return {
    gained: XP_REWARDS[action],
    ...getLevelInfo(user.xp),
  }
}
