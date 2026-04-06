<script>
  import {
    tr, getLang, getHasGyroscope, getOrientationGranted, getNeedsPermission,
    categoryKeys, changeLang, enableMotion, selectCategory,
  } from '../state.svelte.js'
</script>

<section class="fixed inset-0 flex flex-col items-center p-4 sm:p-6 overflow-y-auto bg-bg">
  <div class="w-full max-w-2xl flex items-center justify-between mb-6 mt-2">
    <h2 class="text-2xl sm:text-3xl font-bold text-white">{tr('selectCategory')}</h2>
    <button
      onclick={changeLang}
      class="px-4 py-2 rounded-xl bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition"
    >
      {getLang() === 'sv' ? 'English' : 'Svenska'}
    </button>
  </div>

  {#if getNeedsPermission() && !getOrientationGranted()}
    <button
      onclick={enableMotion}
      class="mb-4 px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm animate-pulse"
    >
      {tr('enableMotion')}
    </button>
  {/if}

  {#if !getHasGyroscope()}
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
