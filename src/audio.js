let audioCtx = null

function getContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  }
  return audioCtx
}

function playTone(freq, duration, type = 'sine', volume = 0.3, delay = 0) {
  try {
    const ctx = getContext()
    const start = ctx.currentTime + delay
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = freq
    osc.type = type
    gain.gain.setValueAtTime(volume, start)
    gain.gain.exponentialRampToValueAtTime(0.01, start + duration / 1000)
    osc.start(start)
    osc.stop(start + duration / 1000)
  } catch {}
}

export function playCorrect() {
  playTone(440, 120)
  playTone(660, 150, 'sine', 0.3, 0.1)
  vibrate(200)
}

export function playPass() {
  playTone(300, 120, 'square', 0.2)
  playTone(200, 150, 'square', 0.2, 0.1)
  vibrate([100, 50, 100])
}

export function playCountdownBeep() {
  playTone(800, 100)
}

export function playTimeUp() {
  playTone(400, 200, 'sawtooth', 0.2)
  playTone(300, 300, 'sawtooth', 0.2, 0.2)
}

export function resumeAudio() {
  const ctx = getContext()
  if (ctx.state === 'suspended') ctx.resume()
}

function vibrate(pattern) {
  if (navigator.vibrate) navigator.vibrate(pattern)
}
