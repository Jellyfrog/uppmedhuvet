import sv from './sv.js'
import en from './en.js'

const translations = { sv, en }

export function t(lang, key) {
  const keys = key.split('.')
  let value = translations[lang]
  for (const k of keys) {
    if (value == null) return key
    value = value[k]
  }
  return value ?? key
}

export { translations }
