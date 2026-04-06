// Phone on forehead = beta ≈ 90°. Tilt forward (down) = correct, tilt back (up) = pass.
const NEUTRAL_MIN = 50
const NEUTRAL_MAX = 130
const TILT_DOWN_THRESHOLD = 130 // beta > this = correct (tilted forward past vertical)
const TILT_UP_THRESHOLD = 50   // beta < this = pass (tilted back toward flat)
const COOLDOWN_MS = 1500

let listener = null
let cooldown = false
let armed = false // must enter neutral zone (~90°) before triggers activate
let onCorrect = null
let onPass = null

function handleOrientation(event) {
  if (cooldown) return

  const beta = event.beta
  if (beta == null) return

  // Require phone to be in the neutral zone first (held upright ~90°)
  if (!armed) {
    if (beta > NEUTRAL_MIN && beta < NEUTRAL_MAX) {
      armed = true
    }
    return
  }

  if (beta > TILT_DOWN_THRESHOLD) {
    trigger(onCorrect)
  } else if (beta < TILT_UP_THRESHOLD && beta > -TILT_UP_THRESHOLD) {
    trigger(onPass)
  }
}

function trigger(cb) {
  armed = false // must return to neutral before next trigger
  cooldown = true
  setTimeout(() => { cooldown = false }, COOLDOWN_MS)
  if (cb) cb()
}

export function startListening(correctCb, passCb) {
  onCorrect = correctCb
  onPass = passCb
  armed = false
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
