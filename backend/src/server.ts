import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import { z } from 'zod'
import { buildTimeline, generateLesson, generateOpportunities, generateQuiz, generateSkillTree, recommendCareers } from './engine.js'
import { addXp, getDashboard, login, signup } from './store.js'

const app = express()
app.use(cors())
app.use(express.json())

const profileSchema = z.object({
  name: z.string().min(1),
  age: z.number().int().min(8).max(99),
  grade: z.string().min(1),
  experienceLevel: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  interests: z.array(z.string()).min(1),
  dreamCareer: z.string().optional(),
})

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, name: 'DreamQuest AI API' })
})

app.post('/api/auth/signup', (req, res) => {
  const payload = z.object({ email: z.string().email(), password: z.string().min(6), profile: profileSchema }).safeParse(req.body)
  if (!payload.success) return res.status(400).json({ error: payload.error.flatten() })
  try {
    res.json(signup(payload.data.email, payload.data.password, payload.data.profile))
  } catch (err) {
    res.status(400).json({ error: (err as Error).message })
  }
})

app.post('/api/auth/login', (req, res) => {
  const payload = z.object({ email: z.string().email(), password: z.string().min(6) }).safeParse(req.body)
  if (!payload.success) return res.status(400).json({ error: payload.error.flatten() })
  try {
    res.json(login(payload.data.email, payload.data.password))
  } catch (err) {
    res.status(401).json({ error: (err as Error).message })
  }
})

app.post('/api/careers/recommendations', (req, res) => {
  const payload = profileSchema.safeParse(req.body)
  if (!payload.success) return res.status(400).json({ error: payload.error.flatten() })
  res.json(recommendCareers(payload.data))
})

app.get('/api/dashboard/:userId', (req, res) => {
  try {
    res.json(getDashboard(req.params.userId))
  } catch (err) {
    res.status(404).json({ error: (err as Error).message })
  }
})

app.post('/api/xp', (req, res) => {
  const payload = z.object({ userId: z.string().min(1), action: z.enum(['lesson', 'quiz', 'challenge', 'project', 'bossBattle']) }).safeParse(req.body)
  if (!payload.success) return res.status(400).json({ error: payload.error.flatten() })
  try {
    res.json(addXp(payload.data.userId, payload.data.action))
  } catch (err) {
    res.status(404).json({ error: (err as Error).message })
  }
})

app.post('/api/lesson', (req, res) => {
  const payload = z.object({ topic: z.string().min(1), profile: profileSchema }).safeParse(req.body)
  if (!payload.success) return res.status(400).json({ error: payload.error.flatten() })
  res.json(generateLesson(payload.data.topic, payload.data.profile))
})

app.get('/api/quiz/:topic', (req, res) => res.json(generateQuiz(req.params.topic)))
app.get('/api/skill-tree/:career', (req, res) => res.json(generateSkillTree(req.params.career)))
app.get('/api/opportunities', (req, res) => {
  const interests = typeof req.query.interests === 'string' ? req.query.interests.split(',') : ['Technology']
  const grade = typeof req.query.grade === 'string' ? req.query.grade : '10'
  res.json(generateOpportunities(interests, grade))
})
app.get('/api/timeline/:career', (req, res) => res.json(buildTimeline(req.params.career)))

const port = Number(process.env.PORT || 3001)
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`DreamQuest API running on ${port}`)
  })
}

export default app
