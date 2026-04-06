import animals from './animals.js'
import movies from './movies.js'
import professions from './professions.js'
import food from './food.js'
import sports from './sports.js'
import celebrities from './celebrities.js'

export const categories = {
  animals,
  movies,
  professions,
  food,
  sports,
  celebrities,
}

export function getWords(category, lang) {
  const cat = categories[category]
  if (!cat) return []
  return [...(cat[lang] || cat.en)]
}

export function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}
