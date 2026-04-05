<script>
  import { t } from './i18n/index.js'
  import { categories, getWords, shuffle } from './dictionaries/index.js'
  import { playCorrect, playPass, playCountdownBeep, playTimeUp, resumeAudio } from './audio.js'
  import {
    startListening, stopListening, requestPermission,
    isSupported, needsPermission,
  } from './orientation.js'

  const ROUND_SECONDS = 60
  const categoryKeys = Object.keys(categories)

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
  function tr(key) {
    return t(lang, key)
  }

  // Actions
  function selectLanguage(l) {
    lang = l
    resumeAudio()
    screen = 'menu'
  }

  function changeLang() {
    lang = lang === 'sv' ? 'en' : 'sv'
  }

  async function enableMotion() {
    orientationGranted = await requestPermission()
  }

  function selectCategory(cat) {
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

  function markCorrect() {
    if (screen !== 'playing') return
    results = [...results, { word: currentWord, result: 'correct' }]
    playCorrect()
    flash('correct')
    nextWord()
  }

  function markPass() {
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

  function goToMenu() { screen = 'menu' }
  function playAgain() { selectCategory(category) }

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
</script>

<!-- ============================================================ -->
<!-- SCREEN: Language Select                                       -->
<!-- ============================================================ -->
{#if screen === 'lang-select'}
  <section class="fixed inset-0 flex flex-col items-center justify-center gap-8 p-6 bg-bg">
    <h1 class="text-4xl sm:text-5xl font-black tracking-tight text-center text-white">
      Upp med huvudet!
    </h1>
    <p class="text-lg text-white/60">Välj språk / Select language</p>
    <div class="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
      <button
        onclick={() => selectLanguage('sv')}
        class="flex-1 py-5 px-8 rounded-2xl bg-accent text-white text-xl font-bold hover:bg-accent/80 active:scale-95 transition-all"
      >
        Svenska
      </button>
      <button
        onclick={() => selectLanguage('en')}
        class="flex-1 py-5 px-8 rounded-2xl bg-accent text-white text-xl font-bold hover:bg-accent/80 active:scale-95 transition-all"
      >
        English
      </button>
    </div>
  </section>
{/if}

<!-- ============================================================ -->
<!-- SCREEN: Category Select (Menu)                                -->
<!-- ============================================================ -->
{#if screen === 'menu'}
  <section class="fixed inset-0 flex flex-col items-center p-4 sm:p-6 overflow-y-auto bg-bg">
    <div class="w-full max-w-2xl flex items-center justify-between mb-6 mt-2">
      <h2 class="text-2xl sm:text-3xl font-bold text-white">{tr('selectCategory')}</h2>
      <button
        onclick={changeLang}
        class="px-4 py-2 rounded-xl bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition"
      >
        {lang === 'sv' ? 'English' : 'Svenska'}
      </button>
    </div>

    {#if needsPermission() && !orientationGranted}
      <button
        onclick={enableMotion}
        class="mb-4 px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm animate-pulse"
      >
        {tr('enableMotion')}
      </button>
    {/if}

    {#if !hasGyroscope}
      <p class="mb-4 text-sm text-yellow-400 text-center">{tr('noGyroscope')}</p>
    {/if}

    <div class="w-full max-w-2xl grid grid-cols-2 gap-3 sm:gap-4">
      {#each categoryKeys as cat}
        <button
          onclick={() => selectCategory(cat)}
          class="category-card flex flex-col items-center justify-center gap-2 p-5 sm:p-6 rounded-2xl bg-bg-light border border-white/10 hover:border-primary/50 hover:bg-bg-light/80 text-white"
        >
          <span class="text-3xl sm:text-4xl">{tr(`categoryEmojis.${cat}`)}</span>
          <span class="text-base sm:text-lg font-semibold">{tr(`categories.${cat}`)}</span>
        </button>
      {/each}
    </div>
  </section>
{/if}

<!-- ============================================================ -->
<!-- SCREEN: Countdown                                             -->
<!-- ============================================================ -->
{#if screen === 'countdown'}
  <section class="fixed inset-0 flex flex-col items-center justify-center gap-4 p-6 bg-bg">
    <p class="text-xl sm:text-2xl text-white/70 text-center font-medium">{tr('holdOnForehead')}</p>
    <div class="countdown-number font-black text-white">{countdownNumber}</div>
    <div class="flex gap-6 text-sm text-white/50">
      <span>⬇️ {tr('tiltDown')}</span>
      <span>⬆️ {tr('tiltUp')}</span>
    </div>
  </section>
{/if}

<!-- ============================================================ -->
<!-- SCREEN: Playing                                               -->
<!-- ============================================================ -->
{#if screen === 'playing'}
  <section class="fixed inset-0 flex flex-col bg-bg">
    <!-- Timer bar -->
    <div class="w-full h-2 bg-white/10">
      <div
        class="timer-bar h-full bg-primary rounded-r-full"
        style="width: {timerPercent}%"
      ></div>
    </div>

    <div class="text-center pt-2 text-lg font-mono text-white/60">{timeLeft}s</div>

    <!-- Word display -->
    <div class="flex-1 flex items-center justify-center px-6">
      <h1 class="word-display font-black text-center text-white uppercase leading-tight">
        {currentWord}
      </h1>
    </div>

    <!-- Flash overlays -->
    {#if showFlash === 'correct'}
      <div class="fixed inset-0 bg-correct pointer-events-none flash-correct"></div>
    {/if}
    {#if showFlash === 'pass'}
      <div class="fixed inset-0 bg-pass pointer-events-none flash-pass"></div>
    {/if}

    <!-- Fallback tap buttons -->
    {#if showFallback}
      <div class="fixed inset-0 top-12 grid grid-cols-2">
        <button
          onclick={markCorrect}
          class="fallback-btn flex items-center justify-center bg-correct/20 border-r border-white/10 text-correct text-xl font-bold"
        >
          {tr('tapCorrect')}
        </button>
        <button
          onclick={markPass}
          class="fallback-btn flex items-center justify-center bg-pass/20 text-pass text-xl font-bold"
        >
          {tr('tapPass')}
        </button>
      </div>
    {/if}

    <!-- Score pill -->
    <div class="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-white/10 text-sm font-mono text-white">
      {correctCount} ✓
    </div>
  </section>
{/if}

<!-- ============================================================ -->
<!-- SCREEN: Results                                               -->
<!-- ============================================================ -->
{#if screen === 'results'}
  <section class="fixed inset-0 flex flex-col items-center p-4 sm:p-6 overflow-y-auto bg-bg">
    <h2 class="text-3xl sm:text-4xl font-black mt-4 mb-2 text-white">{tr('results')}</h2>

    <div class="flex gap-6 mb-6 text-lg text-white">
      <div class="flex items-center gap-2">
        <span class="w-3 h-3 rounded-full bg-correct inline-block"></span>
        <span><strong>{correctCount}</strong> {tr('wordsGuessed')}</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="w-3 h-3 rounded-full bg-pass inline-block"></span>
        <span><strong>{passCount}</strong> {tr('wordsPassed')}</span>
      </div>
    </div>

    <div class="w-full max-w-md space-y-2 mb-6">
      {#each results as item}
        <div
          class="flex items-center justify-between px-4 py-3 rounded-xl {item.result === 'correct' ? 'bg-correct/15' : 'bg-pass/15'}"
        >
          <span class="font-medium text-white">{item.word}</span>
          <span class="text-lg {item.result === 'correct' ? 'text-correct' : 'text-pass'}">
            {item.result === 'correct' ? '✓' : '✗'}
          </span>
        </div>
      {/each}
    </div>

    <div class="flex gap-4 w-full max-w-md mb-8">
      <button
        onclick={goToMenu}
        class="flex-1 py-4 rounded-2xl bg-white/10 text-white font-bold text-lg hover:bg-white/20 transition active:scale-95"
      >
        {tr('backToMenu')}
      </button>
      <button
        onclick={playAgain}
        class="flex-1 py-4 rounded-2xl bg-primary text-white font-bold text-lg hover:bg-primary/80 transition active:scale-95"
      >
        {tr('playAgain')}
      </button>
    </div>
  </section>
{/if}

<!-- ============================================================ -->
<!-- OVERLAY: Rotate to landscape (during gameplay)                -->
<!-- ============================================================ -->
{#if screen === 'playing' || screen === 'countdown'}
  <div class="landscape-only fixed inset-0 z-50 bg-bg/95 flex-col items-center justify-center gap-4 hidden">
    <div class="text-5xl">📱↔️</div>
    <p class="text-xl text-white/80 text-center px-8">{tr('rotate')}</p>
  </div>
{/if}
