<script>
  import { getScreen } from './state.svelte.js'
  import LanguageSelect from './screens/LanguageSelect.svelte'
  import CategorySelect from './screens/CategorySelect.svelte'
  import Countdown from './screens/Countdown.svelte'
  import Playing from './screens/Playing.svelte'
  import Results from './screens/Results.svelte'
  import RotateOverlay from './components/RotateOverlay.svelte'

  let screen = $derived(getScreen())
</script>

{#if screen === 'lang-select'}
  <LanguageSelect />
{:else if screen === 'menu'}
  <CategorySelect />
{:else if screen === 'countdown'}
  <Countdown />
  <RotateOverlay />
{:else if screen === 'playing'}
  <Playing />
  <RotateOverlay />
{:else if screen === 'results'}
  <Results />
{/if}
