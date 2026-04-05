let audioCtx = null

function getContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

function playTone(freq, duration, type = 'sine', volume = 0.3) {
  try {
    const ctx = getContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = freq
    osc.type = type
    gain.gain.value = volume
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration / 1000)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + duration / 1000)
  } catch {
    // Audio not available
  }
}

export function playCorrect() {
  playTone(440, 120)
  setTimeout(() => playTone(660, 150), 100)
  vibrate(200)
}

export function playPass() {
  playTone(300, 120, 'square', 0.2)
  setTimeout(() => playTone(200, 150, 'square', 0.2), 100)
  vibrate([100, 50, 100])
}

export function playCountdownBeep() {
  playTone(800, 100)
}

export function playTimeUp() {
  playTone(400, 200, 'sawtooth', 0.2)
  setTimeout(() => playTone(300, 300, 'sawtooth', 0.2), 200)
}

export function resumeAudio() {
  getContext()
}

function vibrate(pattern) {
  if (navigator.vibrate) {
    navigator.vibrate(pattern)
  }
}
