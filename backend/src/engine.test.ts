import assert from 'node:assert/strict'
import test from 'node:test'
import { XP_REWARDS, buildTimeline, generateLesson, generateQuiz, getLevelInfo, recommendCareers, type Profile } from './engine.js'

const profile: Profile = {
  name: 'Alex',
  age: 15,
  grade: '10',
  experienceLevel: 'Beginner',
  interests: ['Technology', 'Mathematics'],
}

test('recommendCareers returns sorted top matches', () => {
  const result = recommendCareers(profile)
  assert.ok(result[0] && result[1])
  assert.equal(result.length, 4)
  assert.ok(result[0]!.match >= result[1]!.match)
  assert.match(result[0]!.reason, /Based on interests/)
})

test('getLevelInfo maps xp to level progression', () => {
  const level = getLevelInfo(XP_REWARDS.project)
  assert.equal(level.level, 3)
  assert.equal(level.levelTitle, 'Explorer')
  assert.ok(level.progressToNext >= 0)
})

test('lesson and quiz generation include required fields', () => {
  const lesson = generateLesson('Python Variables', profile)
  const quiz = generateQuiz('Python Variables')
  assert.ok(lesson.explanation.length > 10)
  assert.equal(quiz.options.length, 4)
  assert.equal(typeof quiz.correctAnswer, 'number')
})

test('timeline returns future milestones', () => {
  const timeline = buildTimeline('AI Engineer')
  assert.equal(timeline[0]?.year, '2026')
  assert.match(timeline[timeline.length - 1]?.milestone ?? '', /Senior/)
})
