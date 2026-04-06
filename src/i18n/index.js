import sv from './sv.js'
import en from './en.js'

const categoryEmojis = {
  animals: '🐾',
  movies: '🎬',
  professions: '👷',
  food: '🍕',
  sports: '⚽',
  celebrities: '⭐',
}

const translations = {
  sv: { ...sv, categoryEmojis },
  en: { ...en, categoryEmojis },
}

export function t(lang, key) {
  const keys = key.split('.')
  let value = translations[lang]
  for (const k of keys) {
    if (value == null) return key
    value = value[k]
  }
  return value ?? key
}
