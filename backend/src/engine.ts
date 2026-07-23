export type Profile = {
  name: string
  age: number
  grade: string
  experienceLevel: 'Beginner' | 'Intermediate' | 'Advanced'
  interests: string[]
  dreamCareer?: string
}

export type CareerMatch = {
  title: string
  match: number
  description: string
  salaryRange: string
  skills: string[]
  education: string
  reason: string
}

const CAREER_MATRIX: Record<string, CareerMatch> = {
  'AI Engineer': {
    title: 'AI Engineer',
    match: 70,
    description: 'Build intelligent systems using machine learning and data.',
    salaryRange: '$110k - $190k',
    skills: ['Python', 'Mathematics', 'Machine Learning', 'Cloud Computing'],
    education: 'Computer Science or related STEM degree',
    reason: 'Strong fit for technology, data, and problem-solving interests.'
  },
  'Data Scientist': {
    title: 'Data Scientist',
    match: 68,
    description: 'Analyze data to discover insights and guide decisions.',
    salaryRange: '$95k - $170k',
    skills: ['Python', 'Statistics', 'Data Visualization', 'SQL'],
    education: 'Data Science, Statistics, or Computer Science',
    reason: 'Ideal for analytical thinkers who enjoy math and science.'
  },
  'Game Developer': {
    title: 'Game Developer',
    match: 66,
    description: 'Design and build engaging games for web, mobile, and PC.',
    salaryRange: '$80k - $150k',
    skills: ['JavaScript', 'C#', 'Game Design', 'Graphics'],
    education: 'Software Engineering, Game Design, or equivalent portfolio',
    reason: 'Combines creativity, coding, and interactive storytelling.'
  },
  'Cybersecurity Analyst': {
    title: 'Cybersecurity Analyst',
    match: 64,
    description: 'Protect systems, detect threats, and secure data.',
    salaryRange: '$85k - $155k',
    skills: ['Networking', 'Security Operations', 'Scripting', 'Risk Analysis'],
    education: 'Cybersecurity, IT, or Computer Science',
    reason: 'Great path for students who like puzzles and digital defense.'
  },
  'Product Manager': {
    title: 'Product Manager',
    match: 62,
    description: 'Lead product strategy and coordinate teams to ship value.',
    salaryRange: '$95k - $180k',
    skills: ['Communication', 'Roadmapping', 'User Research', 'Analytics'],
    education: 'Business, Engineering, or multidisciplinary background',
    reason: 'Good for leadership-minded students with business and tech interests.'
  },
}

const INTEREST_BOOSTS: Record<string, Array<keyof typeof CAREER_MATRIX>> = {
  Technology: ['AI Engineer', 'Data Scientist', 'Cybersecurity Analyst', 'Product Manager'],
  Gaming: ['Game Developer', 'AI Engineer'],
  Sports: ['Product Manager', 'Data Scientist'],
  Robotics: ['AI Engineer', 'Data Scientist'],
  Health: ['Data Scientist', 'Product Manager'],
  Business: ['Product Manager', 'Data Scientist'],
  Art: ['Game Developer', 'Product Manager'],
  Design: ['Game Developer', 'Product Manager'],
  Psychology: ['Product Manager', 'Data Scientist'],
  Science: ['AI Engineer', 'Data Scientist'],
  Mathematics: ['AI Engineer', 'Data Scientist'],
  Music: ['Game Developer', 'Product Manager'],
  Finance: ['Data Scientist', 'Product Manager'],
}

export const XP_REWARDS = {
  lesson: 50,
  quiz: 25,
  challenge: 100,
  project: 500,
  bossBattle: 1000,
} as const

export const LEVEL_TITLES: Array<{ level: number; title: string }> = [
  { level: 1, title: 'Explorer' },
  { level: 5, title: 'Apprentice' },
  { level: 10, title: 'Builder' },
  { level: 20, title: 'Specialist' },
  { level: 30, title: 'Professional' },
  { level: 50, title: 'Master' },
]

export function getLevelInfo(xp: number) {
  const level = Math.max(1, Math.floor(xp / 250) + 1)
  const currentLevelXp = (level - 1) * 250
  const nextLevelXp = level * 250
  const levelTitle = LEVEL_TITLES.slice().reverse().find((item) => level >= item.level)?.title ?? 'Explorer'
  return {
    level,
    levelTitle,
    xp,
    progressToNext: Math.min(100, Math.round(((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100)),
  }
}

export function recommendCareers(profile: Profile): CareerMatch[] {
  const scores = Object.fromEntries(
    (Object.keys(CAREER_MATRIX) as Array<keyof typeof CAREER_MATRIX>).map((key) => [key, CAREER_MATRIX[key].match]),
  ) as Record<keyof typeof CAREER_MATRIX, number>

  for (const interest of profile.interests) {
    const matches = INTEREST_BOOSTS[interest] ?? []
    for (const career of matches) {
      scores[career] = (scores[career] ?? 0) + 8
    }
  }

  if (profile.experienceLevel === 'Advanced') {
    scores['AI Engineer'] = (scores['AI Engineer'] ?? 0) + 4
    scores['Cybersecurity Analyst'] = (scores['Cybersecurity Analyst'] ?? 0) + 4
  }

  if (profile.dreamCareer && profile.dreamCareer in CAREER_MATRIX) {
    const dreamCareer = profile.dreamCareer as keyof typeof CAREER_MATRIX
    scores[dreamCareer] = (scores[dreamCareer] ?? 0) + 12
  }

  return (Object.keys(scores) as Array<keyof typeof scores>)
    .map((title) => {
      const career = CAREER_MATRIX[title]
      return {
        ...career,
        match: Math.min(99, scores[title]),
        reason: `${career.reason} Based on interests: ${profile.interests.join(', ') || 'general exploration'}.`,
      }
    })
    .sort((a, b) => b.match - a.match)
    .slice(0, 4)
}

export function generateSkillTree(career: string) {
  const root = CAREER_MATRIX[career]?.skills ?? ['Communication', 'Projects', 'Portfolio']
  return root.map((skill, index) => ({
    skill,
    unlocked: index === 0,
    completion: index === 0 ? 20 : 0,
  }))
}

export function generateLesson(topic: string, profile: Profile) {
  const simplicity = profile.age < 14 || profile.experienceLevel === 'Beginner'
  return {
    topic,
    explanation: simplicity
      ? `${topic} is a skill you can learn step-by-step. Think of it like building blocks.`
      : `${topic} is foundational for professional projects and should be practiced with real-world examples.`,
    example: topic.toLowerCase().includes('python') ? 'name = "Alex"\nage = 16' : `Practice ${topic} with a small project this week.`,
    practiceQuestions: [
      `What is the main purpose of ${topic}?`,
      `How would you apply ${topic} in a project related to ${profile.interests[0] ?? 'your interests'}?`,
    ],
  }
}

export function generateQuiz(topic: string) {
  return {
    topic,
    question: `Which option best describes why ${topic} matters?`,
    options: [
      `${topic} helps you build practical career-ready skills`,
      `${topic} is only useful in college`,
      `${topic} should be ignored until senior year`,
      `${topic} is unrelated to projects`,
    ],
    correctAnswer: 0,
    explanation: `${topic} helps students build transferable skills and confidence through practice.`,
  }
}

export function generateOpportunities(interests: string[], grade: string) {
  const focus = interests[0] ?? 'Technology'
  return [
    {
      name: `${focus} Scholars Program`,
      description: `A student pathway for ${focus.toLowerCase()} enthusiasts.`,
      eligibility: `Grade ${grade} and above`,
      difficulty: 'Intermediate',
      relevance: 96,
    },
    {
      name: 'National Student Hackathon',
      description: 'Team-based innovation challenge with mentors and prizes.',
      eligibility: 'Open to middle/high school students',
      difficulty: 'Advanced',
      relevance: 90,
    },
    {
      name: 'Open Source Starter Quest',
      description: 'Beginner-friendly contribution sprint for first pull requests.',
      eligibility: 'No prior internship required',
      difficulty: 'Beginner',
      relevance: 88,
    },
  ]
}

export function buildTimeline(career: string) {
  return [
    { year: '2026', milestone: 'Learn Python and fundamentals' },
    { year: '2027', milestone: 'Build portfolio projects' },
    { year: '2028', milestone: 'Complete first internship or mentorship' },
    { year: '2030', milestone: 'Complete degree or equivalent credentials' },
    { year: '2032', milestone: `Start as Junior ${career}` },
    { year: '2035', milestone: `Grow into Senior ${career}` },
  ]
}
