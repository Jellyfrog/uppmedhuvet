import { t } from './i18n/index.js'
import { categories, getWords, shuffle } from './dictionaries/index.js'
import { playCorrect, playPass, playCountdownBeep, playTimeUp, resumeAudio } from './audio.js'
import {
  startListening, stopListening, requestPermission,
  isSupported, needsPermission,
} from './orientation.js'

const TIME_OPTIONS = [30, 45, 60, 90, 120]
const DEFAULT_TIME = 60
const hasGyroscope = isSupported()
const gyroNeedsPermission = needsPermission()

export const categoryKeys = Object.keys(categories)
export { TIME_OPTIONS }

let screen = $state('lang-select')
let lang = $state('sv')
let category = $state(null)
let roundSeconds = $state(DEFAULT_TIME)
let words = $state([])
let wordIndex = $state(0)
let results = $state([])
let timeLeft = $state(DEFAULT_TIME)
let countdownNumber = $state(3)
let showFlash = $state(null)
let orientationGranted = $state(false)
let permissionDenied = $state(false)

let timerInterval = null
let countdownInterval = null
let wakeLock = null
let tapCooldown = false
let flashTimeout = null

let currentWord = $derived(words[wordIndex] || '')
let correctCount = $derived(results.filter(r => r.result === 'correct').length)
let passCount = $derived(results.filter(r => r.result === 'pass').length)
let timerPercent = $derived((timeLeft / roundSeconds) * 100)
let showFallback = $derived(!hasGyroscope || (gyroNeedsPermission && !orientationGranted))

export function tr(key) {
  return t(lang, key)
}

export function getScreen() { return screen }
export function getLang() { return lang }
export function getCategory() { return category }
export function getCurrentWord() { return currentWord }
export function getCorrectCount() { return correctCount }
export function getPassCount() { return passCount }
export function getTimerPercent() { return timerPercent }
export function getTimeLeft() { return timeLeft }
export function getRoundSeconds() { return roundSeconds }
export function getCountdownNumber() { return countdownNumber }
export function getShowFlash() { return showFlash }
export function getHasGyroscope() { return hasGyroscope }
export function getShowFallback() { return showFallback }
export function getOrientationGranted() { return orientationGranted }
export function getResults() { return results }
export function getNeedsPermission() { return gyroNeedsPermission }

function setLang(l) {
  lang = l
  document.documentElement.lang = l
}

export function selectLanguage(l) {
  setLang(l)
  resumeAudio()
  screen = 'menu'
}

export function changeLang() {
  setLang(lang === 'sv' ? 'en' : 'sv')
}

export function getPermissionDenied() { return permissionDenied }

export async function enableMotion() {
  orientationGranted = await requestPermission()
  permissionDenied = !orientationGranted
}

export function selectCategory(cat) {
  category = cat
  screen = 'setup'
}

export function setRoundSeconds(s) {
  roundSeconds = s
}

export async function startGame() {
  words = shuffle(getWords(category, lang))
  wordIndex = 0
  results = []
  timeLeft = roundSeconds
  showFlash = null

  // Auto-request motion permission (needs user gesture context)
  if (hasGyroscope && gyroNeedsPermission && !orientationGranted) {
    orientationGranted = await requestPermission()
    permissionDenied = !orientationGranted
  }

  startCountdown()
}

function startCountdown() {
  if (countdownInterval) { clearInterval(countdownInterval); countdownInterval = null }
  screen = 'countdown'
  countdownNumber = 3
  playCountdownBeep()
  countdownInterval = setInterval(() => {
    countdownNumber--
    if (countdownNumber <= 0) {
      clearInterval(countdownInterval)
      countdownInterval = null
      startPlaying()
    } else {
      playCountdownBeep()
    }
  }, 1000)
}

async function startPlaying() {
  screen = 'playing'
  await acquireWakeLock()
  await requestFullscreen()

  if (hasGyroscope && (orientationGranted || !gyroNeedsPermission)) {
    startListening(markCorrect, markPass)
  }

  timerInterval = setInterval(() => {
    timeLeft--
    if (timeLeft <= 0) endGame()
  }, 1000)
}

function mark(type, playSound) {
  if (screen !== 'playing' || tapCooldown) return
  tapCooldown = true
  setTimeout(() => { tapCooldown = false }, 500)
  results.push({ word: currentWord, result: type })
  resumeAudio()
  playSound()
  flash(type)
  nextWord()
}

export function markCorrect() { mark('correct', playCorrect) }
export function markPass() { mark('pass', playPass) }

function flash(type) {
  if (flashTimeout) clearTimeout(flashTimeout)
  showFlash = type
  flashTimeout = setTimeout(() => { showFlash = null; flashTimeout = null }, 400)
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
export function playAgain() { startGame() }

async function acquireWakeLock() {
  if ('wakeLock' in navigator) {
    try { wakeLock = await navigator.wakeLock.request('screen') } catch { /* wake lock not available */ }
  }
}
function releaseWakeLock() {
  if (wakeLock) { wakeLock.release(); wakeLock = null }
}

async function requestFullscreen() {
  const el = document.documentElement
  const rfs = el.requestFullscreen || el.webkitRequestFullscreen
  if (rfs) try { await rfs.call(el) } catch { /* fullscreen not available */ }
}
function exitFullscreen() {
  const efs = document.exitFullscreen || document.webkitExitFullscreen
  if (efs && (document.fullscreenElement || document.webkitFullscreenElement)) {
    try { efs.call(document) } catch { /* fullscreen exit unsupported */ }
  }
}
