<script>
  import { selectLanguage } from '../state.svelte.js'
</script>

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
