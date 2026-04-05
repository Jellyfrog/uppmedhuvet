const TILT_DOWN_THRESHOLD = 130
const TILT_UP_THRESHOLD = 50
const COOLDOWN_MS = 1500

let listener = null
let cooldown = false
let onCorrect = null
let onPass = null

function handleOrientation(event) {
  if (cooldown) return

  const beta = event.beta // front-to-back tilt: -180 to 180
  if (beta == null) return

  if (beta > TILT_DOWN_THRESHOLD || beta < -TILT_DOWN_THRESHOLD) {
    // Phone tilted down (screen faces floor)
    triggerAction('correct')
  } else if (beta < TILT_UP_THRESHOLD && beta > -TILT_UP_THRESHOLD) {
    // Phone tilted up (screen faces ceiling)
    triggerAction('pass')
  }
}

function triggerAction(action) {
  cooldown = true
  setTimeout(() => { cooldown = false }, COOLDOWN_MS)

  if (action === 'correct' && onCorrect) onCorrect()
  if (action === 'pass' && onPass) onPass()
}

export function startListening(correctCb, passCb) {
  onCorrect = correctCb
  onPass = passCb
  cooldown = false
  listener = handleOrientation
  window.addEventListener('deviceorientation', listener)
}

export function stopListening() {
  if (listener) {
    window.removeEventListener('deviceorientation', listener)
    listener = null
  }
  onCorrect = null
  onPass = null
}

export async function requestPermission() {
  if (
    typeof DeviceOrientationEvent !== 'undefined' &&
    typeof DeviceOrientationEvent.requestPermission === 'function'
  ) {
    try {
      const perm = await DeviceOrientationEvent.requestPermission()
      return perm === 'granted'
    } catch {
      return false
    }
  }
  // Non-iOS or older browsers — permission not needed
  return true
}

export function isSupported() {
  return 'DeviceOrientationEvent' in window
}

export function needsPermission() {
  return (
    typeof DeviceOrientationEvent !== 'undefined' &&
    typeof DeviceOrientationEvent.requestPermission === 'function'
  )
}
