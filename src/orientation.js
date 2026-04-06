// Tilt detection using accelerometer (works in both portrait and landscape).
// Phone on forehead: z ≈ 0. Tilt down (correct): z goes positive. Tilt up (pass): z goes negative.
const TILT_THRESHOLD = 3.5 // m/s² ≈ 21° tilt from vertical
const COOLDOWN_MS = 1500

let listener = null
let cooldown = false
let onCorrect = null
let onPass = null

function handleMotion(event) {
  if (cooldown) return

  const accel = event.accelerationIncludingGravity
  if (!accel || accel.z == null) return

  const z = accel.z

  if (z > TILT_THRESHOLD) {
    vibrate(200)
    trigger(onCorrect)
  } else if (z < -TILT_THRESHOLD) {
    vibrate([100, 50, 100])
    trigger(onPass)
  }
}

function trigger(cb) {
  cooldown = true
  setTimeout(() => { cooldown = false }, COOLDOWN_MS)
  if (cb) cb()
}

function vibrate(pattern) {
  if (navigator.vibrate) navigator.vibrate(pattern)
}

export function startListening(correctCb, passCb) {
  onCorrect = correctCb
  onPass = passCb
  cooldown = true
  setTimeout(() => { cooldown = false }, COOLDOWN_MS)
  listener = handleMotion
  window.addEventListener('devicemotion', listener)
}

export function stopListening() {
  if (listener) {
    window.removeEventListener('devicemotion', listener)
    listener = null
  }
  onCorrect = null
  onPass = null
}

export async function requestPermission() {
  // iOS 13+ requires permission for DeviceMotionEvent
  if (
    typeof DeviceMotionEvent !== 'undefined' &&
    typeof DeviceMotionEvent.requestPermission === 'function'
  ) {
    try {
      const perm = await DeviceMotionEvent.requestPermission()
      return perm === 'granted'
    } catch {
      return false
    }
  }
  // Non-iOS or older browsers — permission not needed
  return true
}

export function isSupported() {
  return 'DeviceMotionEvent' in window
}

export function needsPermission() {
  return (
    typeof DeviceMotionEvent !== 'undefined' &&
    typeof DeviceMotionEvent.requestPermission === 'function'
  )
}
