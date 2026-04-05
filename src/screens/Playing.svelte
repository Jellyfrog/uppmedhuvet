<script>
  import {
    tr, getCurrentWord, getCorrectCount, getTimerPercent,
    getTimeLeft, getShowFlash, getShowFallback,
    markCorrect, markPass,
  } from '../state.svelte.js'
</script>

<section class="fixed inset-0 flex flex-col bg-bg">
  <!-- Timer bar -->
  <div class="w-full h-2 bg-white/10">
    <div
      class="timer-bar h-full bg-primary rounded-r-full"
      style="width: {getTimerPercent()}%"
    ></div>
  </div>

  <div class="text-center pt-2 text-lg font-mono text-white/60">{getTimeLeft()}s</div>

  <!-- Word display -->
  <div class="flex-1 flex items-center justify-center px-6">
    <h1 class="word-display font-black text-center text-white uppercase leading-tight">
      {getCurrentWord()}
    </h1>
  </div>

  <!-- Flash overlays -->
  {#if getShowFlash() === 'correct'}
    <div class="fixed inset-0 bg-correct pointer-events-none flash-correct"></div>
  {/if}
  {#if getShowFlash() === 'pass'}
    <div class="fixed inset-0 bg-pass pointer-events-none flash-pass"></div>
  {/if}

  <!-- Fallback tap buttons -->
  {#if getShowFallback()}
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
    {getCorrectCount()} ✓
  </div>
</section>
