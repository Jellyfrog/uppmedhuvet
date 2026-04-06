<script>
  import {
    tr, getCategory, getRoundSeconds, getHasGyroscope, getOrientationGranted,
    getPermissionDenied, TIME_OPTIONS, setRoundSeconds, startGame, goToMenu, enableMotion,
  } from '../state.svelte.js'

  function focusOnMount(node) { node.focus() }
</script>

<section use:focusOnMount tabindex="-1" class="fixed inset-0 flex flex-col items-center justify-center gap-6 p-6 bg-bg outline-none">
  <h2 class="text-2xl sm:text-3xl font-bold text-white">
    {tr(`categoryEmojis.${getCategory()}`)} {tr(`categories.${getCategory()}`)}
  </h2>

  <div class="flex flex-col items-center gap-2">
    <p class="text-white/60 text-sm font-medium">{tr('timeLimit')}</p>
    <div class="flex gap-2">
      {#each TIME_OPTIONS as seconds (seconds)}
        <button
          onclick={() => setRoundSeconds(seconds)}
          class="px-4 py-2 rounded-xl font-bold text-sm transition {getRoundSeconds() === seconds ? 'bg-primary text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}"
        >
          {seconds}s
        </button>
      {/each}
    </div>
  </div>

  {#if getPermissionDenied() && !getOrientationGranted()}
    <button
      onclick={enableMotion}
      class="px-6 py-3 rounded-xl bg-accent text-white font-bold text-sm animate-pulse"
    >
      {tr('enableMotion')}
    </button>
  {/if}

  {#if !getHasGyroscope()}
    <p class="text-sm text-yellow-400 text-center">{tr('noGyroscope')}</p>
  {/if}

  <div class="flex gap-4 w-full max-w-sm">
    <button
      onclick={goToMenu}
      class="flex-1 py-4 rounded-2xl bg-white/10 text-white font-bold text-lg hover:bg-white/20 transition active:scale-95"
    >
      {tr('backToMenu')}
    </button>
    <button
      onclick={startGame}
      class="flex-1 py-4 rounded-2xl bg-primary text-white font-bold text-lg hover:bg-primary/80 transition active:scale-95"
    >
      {tr('startGame')}
    </button>
  </div>
</section>
