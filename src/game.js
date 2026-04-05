import { t } from './i18n/index.js'
import { categories, getWords, shuffle } from './dictionaries/index.js'
import { playCorrect, playPass, playCountdownBeep, playTimeUp, resumeAudio } from './audio.js'
import {
  startListening, stopListening, requestPermission,
  isSupported, needsPermission,
} from './orientation.js'

const ROUND_SECONDS = 60

export default function game() {
  return {
    // State
    screen: 'lang-select',
    lang: null,
    category: null,
    words: [],
    wordIndex: 0,
    results: [],
    timeLeft: ROUND_SECONDS,
    countdownNumber: 3,
    timerInterval: null,
    countdownInterval: null,
    wakeLock: null,
    orientationGranted: false,
    showFlash: null, // 'correct' | 'pass' | null

    // Computed
    get currentWord() {
      return this.words[this.wordIndex] || ''
    },
    get correctCount() {
      return this.results.filter(r => r.result === 'correct').length
    },
    get passCount() {
      return this.results.filter(r => r.result === 'pass').length
    },
    get categoryKeys() {
      return Object.keys(categories)
    },
    get hasGyroscope() {
      return isSupported()
    },
    get needsMotionPermission() {
      return needsPermission() && !this.orientationGranted
    },
    get timerPercent() {
      return (this.timeLeft / ROUND_SECONDS) * 100
    },

    // i18n helper
    t(key) {
      return t(this.lang || 'en', key)
    },

    // Actions
    selectLanguage(lang) {
      this.lang = lang
      resumeAudio()
      this.screen = 'menu'
    },

    categoryName(key) {
      return t(this.lang, `categories.${key}`)
    },

    categoryEmoji(key) {
      return t(this.lang, `categoryEmojis.${key}`)
    },

    async enableMotion() {
      const granted = await requestPermission()
      this.orientationGranted = granted
    },

    selectCategory(cat) {
      this.category = cat
      this.words = shuffle(getWords(cat, this.lang))
      this.wordIndex = 0
      this.results = []
      this.timeLeft = ROUND_SECONDS
      this.showFlash = null
      this.startCountdown()
    },

    startCountdown() {
      this.screen = 'countdown'
      this.countdownNumber = 3

      this.countdownInterval = setInterval(() => {
        playCountdownBeep()
        this.countdownNumber--
        if (this.countdownNumber <= 0) {
          clearInterval(this.countdownInterval)
          this.countdownInterval = null
          this.startPlaying()
        }
      }, 1000)
    },

    async startPlaying() {
      this.screen = 'playing'
      await this.acquireWakeLock()
      this.requestFullscreen()

      // Start orientation listening
      if (this.hasGyroscope && (this.orientationGranted || !needsPermission())) {
        startListening(
          () => this.markCorrect(),
          () => this.markPass(),
        )
      }

      // Start timer
      this.timerInterval = setInterval(() => {
        this.timeLeft--
        if (this.timeLeft <= 0) {
          this.endGame()
        }
      }, 1000)
    },

    markCorrect() {
      if (this.screen !== 'playing') return
      this.results.push({ word: this.currentWord, result: 'correct' })
      playCorrect()
      this.flash('correct')
      this.nextWord()
    },

    markPass() {
      if (this.screen !== 'playing') return
      this.results.push({ word: this.currentWord, result: 'pass' })
      playPass()
      this.flash('pass')
      this.nextWord()
    },

    flash(type) {
      this.showFlash = type
      setTimeout(() => { this.showFlash = null }, 400)
    },

    nextWord() {
      this.wordIndex++
      if (this.wordIndex >= this.words.length) {
        this.endGame()
      }
    },

    endGame() {
      if (this.timerInterval) {
        clearInterval(this.timerInterval)
        this.timerInterval = null
      }
      stopListening()
      playTimeUp()
      this.releaseWakeLock()
      this.exitFullscreen()
      this.screen = 'results'
    },

    goToMenu() {
      this.screen = 'menu'
    },

    playAgain() {
      this.selectCategory(this.category)
    },

    changeLang() {
      this.lang = this.lang === 'sv' ? 'en' : 'sv'
    },

    // Wake Lock
    async acquireWakeLock() {
      if ('wakeLock' in navigator) {
        try {
          this.wakeLock = await navigator.wakeLock.request('screen')
        } catch {
          // Not available
        }
      }
    },

    releaseWakeLock() {
      if (this.wakeLock) {
        this.wakeLock.release()
        this.wakeLock = null
      }
    },

    // Fullscreen
    requestFullscreen() {
      const el = document.documentElement
      const rfs = el.requestFullscreen || el.webkitRequestFullscreen
      if (rfs) {
        try { rfs.call(el) } catch { /* ignore */ }
      }
    },

    exitFullscreen() {
      const efs = document.exitFullscreen || document.webkitExitFullscreen
      if (efs && document.fullscreenElement) {
        try { efs.call(document) } catch { /* ignore */ }
      }
    },

    // Cleanup on visibility change (pause/resume wake lock)
    init() {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden && this.screen === 'playing') {
          this.releaseWakeLock()
        } else if (!document.hidden && this.screen === 'playing') {
          this.acquireWakeLock()
        }
      })
    },
  }
}
