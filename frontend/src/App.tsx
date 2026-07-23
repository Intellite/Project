import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BadgeCheck, Brain, Flame, Shield, Sparkles, Swords, Trophy, Zap } from 'lucide-react'
import {
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

type Profile = {
  name: string
  age: number
  grade: string
  experienceLevel: 'Beginner' | 'Intermediate' | 'Advanced'
  interests: string[]
  dreamCareer?: string
}

type Dashboard = {
  user: string
  level: number
  levelTitle: string
  xp: number
  progressToNext: number
  readiness: number
  quests: Array<{ name: string; status: 'active' | 'complete' }>
  skillTree: Array<{ skill: string; unlocked: boolean; completion: number }>
  opportunities: Array<{ name: string; description: string; eligibility: string; difficulty: string; relevance: number }>
  careerRecommendations: Array<{
    title: string
    match: number
    description: string
    salaryRange: string
    skills: string[]
    education: string
    reason: string
  }>
  timeline: Array<{ year: string; milestone: string }>
}

type Quiz = { question: string; options: string[]; correctAnswer: number; explanation: string }

const INTERESTS = [
  'Technology',
  'Gaming',
  'Sports',
  'Robotics',
  'Health',
  'Business',
  'Art',
  'Design',
  'Psychology',
  'Science',
  'Mathematics',
  'Music',
  'Finance',
]

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    ...init,
  })
  if (!response.ok) throw new Error('Request failed')
  return response.json() as Promise<T>
}

function App() {
  const [view, setView] = useState<'landing' | 'onboarding' | 'dashboard'>('landing')
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('student@dreamquest.ai')
  const [password, setPassword] = useState('quest123')
  const [profile, setProfile] = useState<Profile>({
    name: '',
    age: 15,
    grade: '10',
    experienceLevel: 'Beginner',
    interests: ['Technology'],
  })
  const [customInterest, setCustomInterest] = useState('')
  const [userId, setUserId] = useState('')
  const [dashboard, setDashboard] = useState<Dashboard | null>(null)
  const [lesson, setLesson] = useState<{ topic: string; explanation: string; example: string; practiceQuestions: string[] } | null>(null)
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [quizResult, setQuizResult] = useState<string>('')
  const [xpGain, setXpGain] = useState<number | null>(null)

  const particles = useMemo(
    () => Array.from({ length: 20 }, (_, i) => ({ id: i, left: `${(i * 13) % 100}%`, top: `${(i * 19) % 100}%` })),
    [],
  )

  const analytics = useMemo(() => {
    const currentXp = dashboard?.xp ?? 0
    return [
      { label: 'Week 1', xp: Math.max(0, currentXp - 450), readiness: Math.max(0, (dashboard?.readiness ?? 0) - 20) },
      { label: 'Week 2', xp: Math.max(0, currentXp - 300), readiness: Math.max(0, (dashboard?.readiness ?? 0) - 12) },
      { label: 'Week 3', xp: Math.max(0, currentXp - 160), readiness: Math.max(0, (dashboard?.readiness ?? 0) - 6) },
      { label: 'Now', xp: currentXp, readiness: dashboard?.readiness ?? 0 },
    ]
  }, [dashboard])

  const achievementStats = useMemo(
    () => [
      { name: 'Common', value: 4, fill: '#22D3EE' },
      { name: 'Rare', value: 3, fill: '#10B981' },
      { name: 'Epic', value: 2, fill: '#8B5CF6' },
      { name: 'Legendary', value: 1, fill: '#FBBF24' },
    ],
    [],
  )

  async function refreshDashboard(id: string) {
    const data = await api<Dashboard>(`/api/dashboard/${id}`)
    setDashboard(data)
  }

  async function completeAction(action: 'lesson' | 'quiz' | 'challenge' | 'project' | 'bossBattle') {
    if (!userId) return
    const result = await api<{ gained: number }>('/api/xp', {
      method: 'POST',
      body: JSON.stringify({ userId, action }),
    })
    setXpGain(result.gained)
    setTimeout(() => setXpGain(null), 1600)
    await refreshDashboard(userId)
  }

  async function startQuest() {
    const payload = {
      email,
      password,
      profile,
    }
    const auth = await api<{ userId: string }>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    setUserId(auth.userId)
    await refreshDashboard(auth.userId)
    setView('dashboard')
  }

  async function generateRecommendationsIfNeeded() {
    if (profile.dreamCareer) return
    const recs = await api<Array<{ title: string }>>('/api/careers/recommendations', {
      method: 'POST',
      body: JSON.stringify(profile),
    })
    setProfile((prev) => ({ ...prev, dreamCareer: recs[0]?.title }))
  }

  async function generateLessonAndQuiz() {
    const nextLesson = await api<{ topic: string; explanation: string; example: string; practiceQuestions: string[] }>('/api/lesson', {
      method: 'POST',
      body: JSON.stringify({ topic: `${profile.dreamCareer || 'AI Engineer'} Foundations`, profile }),
    })
    setLesson(nextLesson)
    setQuiz(await api<Quiz>(`/api/quiz/${encodeURIComponent(nextLesson.topic)}`))
    setQuizResult('')
  }

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-8 text-slate-100 md:px-10">
      {particles.map((particle) => (
        <motion.div key={particle.id} className="particle" style={{ left: particle.left, top: particle.top }} animate={{ y: [0, -14, 0], opacity: [0.2, 1, 0.2] }} transition={{ duration: 3 + (particle.id % 4), repeat: Infinity }} />
      ))}

      {xpGain && (
        <motion.div
          className="fixed right-4 top-4 z-50 rounded-xl border border-amber-300/40 bg-amber-300/20 px-4 py-2 font-bold text-amber-200"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          +{xpGain} XP
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {view === 'landing' && (
          <motion.main key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mx-auto grid w-full max-w-6xl gap-8">
            <section className="glass glow rounded-3xl p-8 md:p-12">
              <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">DreamQuest AI</p>
              <h1 className="mt-3 text-4xl font-black md:text-6xl">Your Future Starts Here.</h1>
              <p className="mt-4 max-w-2xl text-lg text-slate-300">Discover your dream career, master the skills you need, and turn your future into an adventure.</p>
              <p className="mt-2 text-cyan-300">Discover your future. Learn the skills. Level up your life.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button className="rounded-xl bg-violet-500 px-5 py-3 font-semibold" onClick={() => setView('onboarding')}>Start Quest</button>
                <button className="rounded-xl border border-cyan-300/50 px-5 py-3 font-semibold" onClick={() => setView('onboarding')}>Explore Careers</button>
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-3">
              {[
                ['AI Career Discovery', 'Smart interest analysis with match percentages and personalized reasoning.'],
                ['Skill Trees + Quests', 'Unlock lessons, complete challenges, and win boss battles for major XP.'],
                ['Opportunity Finder', 'Scholarships, internships, competitions, and open-source pathways.'],
              ].map(([title, text]) => (
                <article key={title} className="glass glow rounded-2xl p-5">
                  <h3 className="font-bold text-cyan-200">{title}</h3>
                  <p className="mt-2 text-sm text-slate-300">{text}</p>
                </article>
              ))}
            </section>

            <section className="grid gap-4 md:grid-cols-2">
              <article className="glass rounded-2xl p-5">
                <h3 className="font-bold">Career examples</h3>
                <p className="mt-2 text-sm text-slate-300">AI Engineer · Data Scientist · Product Manager · Cybersecurity Analyst</p>
              </article>
              <article className="glass rounded-2xl p-5">
                <h3 className="font-bold">Achievement showcase</h3>
                <p className="mt-2 text-sm text-slate-300">🏅 First Lesson · 🏅 Quiz Master · 🏅 Python Apprentice · 🏅 Career Champion</p>
              </article>
            </section>

            <section className="glass rounded-2xl p-5 text-sm text-slate-300">
              “It feels like Duolingo + RPG + AI mentor in one dashboard.” — Student Beta Tester
            </section>
          </motion.main>
        )}

        {view === 'onboarding' && (
          <motion.main key="onboarding" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="mx-auto w-full max-w-4xl">
            <section className="glass rounded-3xl p-6 md:p-8">
              <h2 className="text-2xl font-bold">Onboarding • Step {step} / 3</h2>
              {step === 1 && (
                <div className="mt-6 grid gap-3 md:grid-cols-2">
                  <input className="rounded-xl bg-slate-900/70 p-3" placeholder="Name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
                  <input className="rounded-xl bg-slate-900/70 p-3" type="number" placeholder="Age" value={profile.age} onChange={(e) => setProfile({ ...profile, age: Number(e.target.value) })} />
                  <input className="rounded-xl bg-slate-900/70 p-3" placeholder="Grade" value={profile.grade} onChange={(e) => setProfile({ ...profile, grade: e.target.value })} />
                  <select className="rounded-xl bg-slate-900/70 p-3" value={profile.experienceLevel} onChange={(e) => setProfile({ ...profile, experienceLevel: e.target.value as Profile['experienceLevel'] })}>
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                  <input className="rounded-xl bg-slate-900/70 p-3" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  <input className="rounded-xl bg-slate-900/70 p-3" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
              )}

              {step === 2 && (
                <div className="mt-6 space-y-4">
                  <p className="text-slate-300">Choose interests (multi-select):</p>
                  <div className="flex flex-wrap gap-2">
                    {INTERESTS.map((interest) => {
                      const selected = profile.interests.includes(interest)
                      return (
                        <button
                          key={interest}
                          className={`rounded-full px-4 py-2 text-sm ${selected ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-200'}`}
                          onClick={() =>
                            setProfile((prev) => ({
                              ...prev,
                              interests: selected ? prev.interests.filter((item) => item !== interest) : [...prev.interests, interest],
                            }))
                          }
                        >
                          {interest}
                        </button>
                      )
                    })}
                  </div>
                  <div className="flex gap-2">
                    <input className="w-full rounded-xl bg-slate-900/70 p-3" placeholder="Custom interest" value={customInterest} onChange={(e) => setCustomInterest(e.target.value)} />
                    <button
                      className="rounded-xl bg-violet-500 px-4"
                      onClick={() => {
                        if (!customInterest.trim()) return
                        setProfile((prev) => ({ ...prev, interests: [...prev.interests, customInterest.trim()] }))
                        setCustomInterest('')
                      }}
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="mt-6 space-y-4">
                  <p>Do you already have a dream career?</p>
                  <div className="flex gap-2">
                    <button className="rounded-xl bg-slate-800 px-4 py-2" onClick={() => setProfile((prev) => ({ ...prev, dreamCareer: '' }))}>No</button>
                    <button className="rounded-xl bg-slate-800 px-4 py-2" onClick={() => setProfile((prev) => ({ ...prev, dreamCareer: prev.dreamCareer || 'AI Engineer' }))}>Yes</button>
                  </div>
                  <input className="w-full rounded-xl bg-slate-900/70 p-3" placeholder="Dream career (optional)" value={profile.dreamCareer || ''} onChange={(e) => setProfile({ ...profile, dreamCareer: e.target.value })} />
                </div>
              )}

              <div className="mt-6 flex justify-between">
                <button className="rounded-xl border border-slate-500 px-4 py-2" onClick={() => setStep((prev) => Math.max(1, prev - 1))}>Back</button>
                {step < 3 ? (
                  <button className="rounded-xl bg-violet-500 px-4 py-2" onClick={() => setStep((prev) => prev + 1)}>Next</button>
                ) : (
                  <button
                    className="rounded-xl bg-cyan-500 px-4 py-2 text-slate-950"
                    onClick={async () => {
                      await generateRecommendationsIfNeeded()
                      await startQuest()
                      await generateLessonAndQuiz()
                    }}
                  >
                    Launch Dashboard
                  </button>
                )}
              </div>
            </section>
          </motion.main>
        )}

        {view === 'dashboard' && dashboard && (
          <motion.main key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mx-auto grid w-full max-w-7xl gap-5 pb-10">
            <section className="glass rounded-3xl p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-3xl font-black">Welcome, {dashboard.user}</h2>
                <p className="text-cyan-300">Level {dashboard.level} · {dashboard.levelTitle} · {dashboard.xp} XP</p>
              </div>
              <div className="mt-4">
                <p className="text-sm text-slate-300">Career Readiness</p>
                <div className="mt-2 h-4 rounded-full bg-slate-800">
                  <motion.div className="h-4 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400" animate={{ width: `${dashboard.readiness}%` }} />
                </div>
                <p className="mt-2 text-amber-300">{dashboard.readiness}%</p>
              </div>
            </section>

            <section className="grid gap-4 lg:grid-cols-3">
              <article className="glass rounded-2xl p-4">
                <h3 className="mb-3 flex items-center gap-2 font-bold"><Brain size={16} /> Career Matches</h3>
                {dashboard.careerRecommendations.map((career) => (
                  <div key={career.title} className="mb-3 rounded-xl bg-slate-900/60 p-3">
                    <div className="flex justify-between font-semibold"><span>{career.title}</span><span>{career.match}%</span></div>
                    <p className="mt-1 text-xs text-slate-300">{career.description}</p>
                    <p className="mt-1 text-xs text-cyan-300">{career.salaryRange}</p>
                  </div>
                ))}
              </article>

              <article className="glass rounded-2xl p-4">
                <h3 className="mb-3 flex items-center gap-2 font-bold"><Zap size={16} /> Active Quests</h3>
                {dashboard.quests.map((quest) => (
                  <p key={quest.name} className="mb-2 rounded-lg bg-slate-900/60 p-2 text-sm">{quest.status === 'complete' ? '✅' : '🗡️'} {quest.name}</p>
                ))}
              </article>

              <article className="glass rounded-2xl p-4">
                <h3 className="mb-3 flex items-center gap-2 font-bold"><Shield size={16} /> Skill Tree</h3>
                {dashboard.skillTree.map((node) => (
                  <motion.div key={node.skill} className="mb-2 rounded-lg bg-slate-900/60 p-2" whileHover={{ scale: 1.01 }}>
                    <div className="flex justify-between text-sm"><span>{node.unlocked ? '🔓' : '🔒'} {node.skill}</span><span>{node.completion}%</span></div>
                  </motion.div>
                ))}
              </article>
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
              <article className="glass rounded-2xl p-4">
                <h3 className="mb-3 flex items-center gap-2 font-bold"><Sparkles size={16} /> AI Lesson + Quiz</h3>
                <button className="mb-3 rounded-xl bg-violet-500 px-4 py-2" onClick={generateLessonAndQuiz}>Generate Personalized Lesson</button>
                {lesson && (
                  <div className="rounded-xl bg-slate-900/60 p-3 text-sm">
                    <p className="font-semibold">{lesson.topic}</p>
                    <p className="mt-2">{lesson.explanation}</p>
                    <pre className="mt-2 overflow-x-auto rounded bg-slate-950 p-2 text-cyan-200">{lesson.example}</pre>
                    <button className="mt-3 rounded-lg bg-emerald-500 px-3 py-1 text-slate-950" onClick={() => completeAction('lesson')}>Mark Lesson Complete (+50 XP)</button>
                  </div>
                )}
                {quiz && (
                  <div className="mt-3 rounded-xl bg-slate-900/60 p-3 text-sm">
                    <p className="font-semibold">{quiz.question}</p>
                    <div className="mt-2 grid gap-2">
                      {quiz.options.map((option, index) => (
                        <button
                          key={option}
                          className="rounded-lg border border-slate-700 p-2 text-left"
                          onClick={async () => {
                            const correct = index === quiz.correctAnswer
                            setQuizResult(`${correct ? 'Correct ✅' : 'Incorrect ❌'} — ${quiz.explanation}`)
                            if (correct) await completeAction('quiz')
                          }}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                    {quizResult && <p className="mt-2 text-cyan-300">{quizResult}</p>}
                  </div>
                )}
              </article>

              <article className="glass rounded-2xl p-4">
                <h3 className="mb-3 flex items-center gap-2 font-bold"><Swords size={16} /> Challenges & Boss Battles</h3>
                <div className="space-y-2 text-sm">
                  <div className="rounded-lg bg-slate-900/60 p-3">Challenge: Create a Python calculator. Reward: +100 XP <button className="ml-2 rounded bg-cyan-500 px-2 py-1 text-slate-950" onClick={() => completeAction('challenge')}>Complete</button></div>
                  <div className="rounded-lg bg-slate-900/60 p-3">Project: Build a portfolio app. Reward: +500 XP <button className="ml-2 rounded bg-emerald-500 px-2 py-1 text-slate-950" onClick={() => completeAction('project')}>Submit</button></div>
                  <div className="rounded-lg bg-slate-900/60 p-3">Boss Battle: Create an AI chatbot. Reward: +1000 XP <button className="ml-2 rounded bg-amber-400 px-2 py-1 text-slate-950" onClick={() => completeAction('bossBattle')}>Defeat Boss</button></div>
                </div>
              </article>
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
              <article className="glass rounded-2xl p-4">
                <h3 className="mb-3 flex items-center gap-2 font-bold"><Flame size={16} /> Opportunity Finder</h3>
                {dashboard.opportunities.map((opp) => (
                  <div key={opp.name} className="mb-2 rounded-xl bg-slate-900/60 p-3 text-sm">
                    <div className="flex justify-between font-semibold"><span>{opp.name}</span><span>{opp.relevance}%</span></div>
                    <p className="text-slate-300">{opp.description}</p>
                    <p className="text-xs text-cyan-300">{opp.eligibility} · {opp.difficulty}</p>
                  </div>
                ))}
              </article>

              <article className="glass rounded-2xl p-4">
                <h3 className="mb-3 flex items-center gap-2 font-bold"><Trophy size={16} /> Career Simulator Timeline</h3>
                {dashboard.timeline.map((stepItem) => (
                  <div key={stepItem.year} className="mb-2 rounded-xl border border-slate-700/70 p-3 text-sm">
                    <p className="font-semibold text-cyan-300">{stepItem.year}</p>
                    <p>{stepItem.milestone}</p>
                  </div>
                ))}
              </article>
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
              <article className="glass rounded-2xl p-4">
                <h3 className="mb-3 font-bold">Analytics</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="label" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip />
                      <Line type="monotone" dataKey="xp" stroke="#22D3EE" strokeWidth={3} />
                      <Line type="monotone" dataKey="readiness" stroke="#10B981" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </article>

              <article className="glass rounded-2xl p-4">
                <h3 className="mb-3 flex items-center gap-2 font-bold"><BadgeCheck size={16} /> Achievement Rarity</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={achievementStats} dataKey="value" nameKey="name" outerRadius={85} label />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-sm text-slate-300">🏅 First Lesson · Quiz Master · Problem Solver · Python Apprentice · AI Explorer · Project Builder · Career Champion</p>
              </article>
            </section>
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
