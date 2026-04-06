<script>
  import {
    tr, getCurrentWord, getCorrectCount, getTimerPercent,
    getTimeLeft, getShowFlash, getShowFallback,
    markCorrect, markPass,
  } from '../state.svelte.js'

  function focusOnMount(node) { node.focus() }
</script>

<section use:focusOnMount tabindex="-1" class="fixed inset-0 flex flex-col bg-bg outline-none" aria-label="Game screen">
  <!-- Timer bar -->
  <div class="w-full h-2 bg-white/10">
    <div
      class="timer-bar h-full bg-primary rounded-r-full"
      role="progressbar"
      aria-valuenow={getTimeLeft()}
      aria-valuemin={0}
      aria-valuemax={60}
      aria-label="Time remaining"
      style="width: {getTimerPercent()}%"
    ></div>
  </div>

  <div class="text-center pt-2 text-lg font-mono text-white/60">{getTimeLeft()}s</div>

  <!-- Word display -->
  <div class="flex-1 flex items-center justify-center px-6">
    <h1 class="word-display font-black text-center text-white uppercase leading-tight" aria-live="polite">
      {getCurrentWord()}
    </h1>
  </div>

  <!-- Flash overlays -->
  {#if getShowFlash() === 'correct'}
    <div class="fixed inset-0 bg-correct pointer-events-none flash-correct" aria-hidden="true"></div>
  {/if}
  {#if getShowFlash() === 'pass'}
    <div class="fixed inset-0 bg-pass pointer-events-none flash-pass" aria-hidden="true"></div>
  {/if}

  <!-- Accessible live region for correct/pass announcements -->
  <div class="sr-only" aria-live="assertive">
    {#if getShowFlash() === 'correct'}{tr('tapCorrect')}{/if}
    {#if getShowFlash() === 'pass'}{tr('tapPass')}{/if}
  </div>

  <!-- Fallback tap buttons -->
  {#if getShowFallback()}
    <div class="fixed inset-0 top-12 grid grid-cols-2">
      <button
        onclick={markCorrect}
        aria-label={tr('tapCorrect')}
        class="fallback-btn flex items-center justify-center bg-correct/20 border-r border-white/10 text-correct text-xl font-bold"
      >
        {tr('tapCorrect')}
      </button>
      <button
        onclick={markPass}
        aria-label={tr('tapPass')}
        class="fallback-btn flex items-center justify-center bg-pass/20 text-pass text-xl font-bold"
      >
        {tr('tapPass')}
      </button>
    </div>
  {/if}

  <!-- Score pill -->
  <div class="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-white/10 text-sm font-mono text-white" aria-label="Score: {getCorrectCount()} correct">
    {getCorrectCount()} ✓
  </div>
</section>
