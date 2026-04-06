// Tilt detection using accelerometer (works in both portrait and landscape).
// Phone on forehead: z ≈ 0. Nod down (correct): z goes negative. Nod up (pass): z goes positive.
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

  // W3C spec: face-up z = +9.81, face-down z = -9.81, forehead z ≈ 0
  // Nod down → screen faces ground → z decreases (negative)
  // Nod up → screen faces sky → z increases (positive)
  if (z < -TILT_THRESHOLD) {
    trigger(onCorrect)
  } else if (z > TILT_THRESHOLD) {
    trigger(onPass)
  }
}

function trigger(cb) {
  cooldown = true
  setTimeout(() => { cooldown = false }, COOLDOWN_MS)
  if (cb) cb()
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
