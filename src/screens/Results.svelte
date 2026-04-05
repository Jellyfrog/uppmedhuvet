<script>
  import {
    tr, getCorrectCount, getPassCount, getResults,
    goToMenu, playAgain,
  } from '../state.svelte.js'
</script>

<section class="fixed inset-0 flex flex-col items-center p-4 sm:p-6 overflow-y-auto bg-bg">
  <h2 class="text-3xl sm:text-4xl font-black mt-4 mb-2 text-white">{tr('results')}</h2>

  <div class="flex gap-6 mb-6 text-lg text-white">
    <div class="flex items-center gap-2">
      <span class="w-3 h-3 rounded-full bg-correct inline-block"></span>
      <span><strong>{getCorrectCount()}</strong> {tr('wordsGuessed')}</span>
    </div>
    <div class="flex items-center gap-2">
      <span class="w-3 h-3 rounded-full bg-pass inline-block"></span>
      <span><strong>{getPassCount()}</strong> {tr('wordsPassed')}</span>
    </div>
  </div>

  <div class="w-full max-w-md space-y-2 mb-6">
    {#each getResults() as item}
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
