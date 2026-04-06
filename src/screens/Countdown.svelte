<script>
  import { tr, getCountdownNumber } from '../state.svelte.js'

  function focusOnMount(node) { node.focus() }
</script>

<section use:focusOnMount tabindex="-1" class="fixed inset-0 flex flex-col items-center justify-center gap-4 p-6 bg-bg outline-none">
  <p class="text-xl sm:text-2xl text-white/70 text-center font-medium">{tr('holdOnForehead')}</p>
  <div class="countdown-number font-black text-white">{getCountdownNumber()}</div>
  <div class="flex gap-6 text-sm text-white/50">
    <span>⬇️ {tr('tiltDown')}</span>
    <span>⬆️ {tr('tiltUp')}</span>
  </div>
</section>
