import { t } from './i18n/index.js'
import { categories, getWords, shuffle } from './dictionaries/index.js'
import { playCorrect, playPass, playCountdownBeep, playTimeUp, resumeAudio } from './audio.js'
import {
  startListening, stopListening, requestPermission,
  isSupported, needsPermission,
} from './orientation.js'

const ROUND_SECONDS = 60

export const categoryKeys = Object.keys(categories)

// Reactive state
let screen = $state('lang-select')
let lang = $state('sv')
let category = $state(null)
let words = $state([])
let wordIndex = $state(0)
let results = $state([])
let timeLeft = $state(ROUND_SECONDS)
let countdownNumber = $state(3)
let showFlash = $state(null)
let orientationGranted = $state(false)

let timerInterval = null
let countdownInterval = null
let wakeLock = null

// Derived
let currentWord = $derived(words[wordIndex] || '')
let correctCount = $derived(results.filter(r => r.result === 'correct').length)
let passCount = $derived(results.filter(r => r.result === 'pass').length)
let timerPercent = $derived((timeLeft / ROUND_SECONDS) * 100)
let hasGyroscope = $derived(isSupported())
let showFallback = $derived(!hasGyroscope || (needsPermission() && !orientationGranted))

// i18n helper
export function tr(key) {
  return t(lang, key)
}

// Getters (export reactive values via functions)
export function getScreen() { return screen }
export function getLang() { return lang }
export function getCategory() { return category }
export function getCurrentWord() { return currentWord }
export function getCorrectCount() { return correctCount }
export function getPassCount() { return passCount }
export function getTimerPercent() { return timerPercent }
export function getTimeLeft() { return timeLeft }
export function getCountdownNumber() { return countdownNumber }
export function getShowFlash() { return showFlash }
export function getHasGyroscope() { return hasGyroscope }
export function getShowFallback() { return showFallback }
export function getOrientationGranted() { return orientationGranted }
export function getResults() { return results }

// Actions
export function selectLanguage(l) {
  lang = l
  resumeAudio()
  screen = 'menu'
}

export function changeLang() {
  lang = lang === 'sv' ? 'en' : 'sv'
}

export async function enableMotion() {
  orientationGranted = await requestPermission()
}

export function selectCategory(cat) {
  category = cat
  words = shuffle(getWords(cat, lang))
  wordIndex = 0
  results = []
  timeLeft = ROUND_SECONDS
  showFlash = null
  startCountdown()
}

function startCountdown() {
  screen = 'countdown'
  countdownNumber = 3
  countdownInterval = setInterval(() => {
    playCountdownBeep()
    countdownNumber--
    if (countdownNumber <= 0) {
      clearInterval(countdownInterval)
      startPlaying()
    }
  }, 1000)
}

async function startPlaying() {
  screen = 'playing'
  await acquireWakeLock()
  requestFullscreen()

  if (hasGyroscope && (orientationGranted || !needsPermission())) {
    startListening(() => markCorrect(), () => markPass())
  }

  timerInterval = setInterval(() => {
    timeLeft--
    if (timeLeft <= 0) endGame()
  }, 1000)
}

export function markCorrect() {
  if (screen !== 'playing') return
  results = [...results, { word: currentWord, result: 'correct' }]
  playCorrect()
  flash('correct')
  nextWord()
}

export function markPass() {
  if (screen !== 'playing') return
  results = [...results, { word: currentWord, result: 'pass' }]
  playPass()
  flash('pass')
  nextWord()
}

function flash(type) {
  showFlash = type
  setTimeout(() => { showFlash = null }, 400)
}

function nextWord() {
  wordIndex++
  if (wordIndex >= words.length) endGame()
}

function endGame() {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null }
  stopListening()
  playTimeUp()
  releaseWakeLock()
  exitFullscreen()
  screen = 'results'
}

export function goToMenu() { screen = 'menu' }
export function playAgain() { selectCategory(category) }

// Wake Lock
async function acquireWakeLock() {
  if ('wakeLock' in navigator) {
    try { wakeLock = await navigator.wakeLock.request('screen') } catch {}
  }
}
function releaseWakeLock() {
  if (wakeLock) { wakeLock.release(); wakeLock = null }
}

// Fullscreen
function requestFullscreen() {
  const el = document.documentElement
  const rfs = el.requestFullscreen || el.webkitRequestFullscreen
  if (rfs) try { rfs.call(el) } catch {}
}
function exitFullscreen() {
  const efs = document.exitFullscreen || document.webkitExitFullscreen
  if (efs && document.fullscreenElement) try { efs.call(document) } catch {}
}
