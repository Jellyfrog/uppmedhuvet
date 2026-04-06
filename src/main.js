import './style.css'
import { mount } from 'svelte'
import App from './App.svelte'

// Try to lock orientation to landscape where supported
try {
  screen.orientation?.lock?.('landscape').catch(() => {})
} catch { /* orientation lock not supported */ }

mount(App, { target: document.getElementById('app') })
