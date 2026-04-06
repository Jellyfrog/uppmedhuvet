import js from '@eslint/js'
import svelte from 'eslint-plugin-svelte'

export default [
  js.configs.recommended,
  ...svelte.configs['flat/recommended'],
  {
    languageOptions: {
      globals: {
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        queueMicrotask: 'readonly',
        AudioContext: 'readonly',
        webkitAudioContext: 'readonly',
        DeviceOrientationEvent: 'readonly',
        DeviceMotionEvent: 'readonly',
        screen: 'readonly',
        fetch: 'readonly',
      },
    },
  },
]
