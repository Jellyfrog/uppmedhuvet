<script>
  import { getScreen } from './state.svelte.js'
  import LanguageSelect from './screens/LanguageSelect.svelte'
  import CategorySelect from './screens/CategorySelect.svelte'
  import Countdown from './screens/Countdown.svelte'
  import Playing from './screens/Playing.svelte'
  import Results from './screens/Results.svelte'
  import RotateOverlay from './components/RotateOverlay.svelte'
</script>

{#if getScreen() === 'lang-select'}
  <LanguageSelect />
{:else if getScreen() === 'menu'}
  <CategorySelect />
{:else if getScreen() === 'countdown'}
  <Countdown />
  <RotateOverlay />
{:else if getScreen() === 'playing'}
  <Playing />
  <RotateOverlay />
{:else if getScreen() === 'results'}
  <Results />
{/if}
