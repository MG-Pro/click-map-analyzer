import FingerprintJS from '@fingerprintjs/fingerprintjs'

const config = {
  apiUrl: API_URL,
  basicToken: 'CE68C8072A0A71863350CFB1BED8349CAD41672E',
}

async function getFingerprint() {
  try {
    const fp = await FingerprintJS.load()
    const result = await fp.get()
    return result.visitorId
  } catch (e) {
    return null
  }
}

function enc(str) {
  return str.split('').reduce((acc, sym) => {
    acc += String.fromCharCode(sym.charCodeAt(0) ^ 123)
    return acc
  })
}

function locationPuller(cb) {
  let oldHref = window.location.href
  setInterval(() => {
    if (oldHref !== window.location.href) {
      oldHref = window.location.href
      cb(window.location.href)
    }
  }, 100)
}

function takeD(visitorId, href) {
  return [
    visitorId,
    window.screen.width,
    window.screen.orientation.type,
    Date.now(),
    window.navigator.language,
    window.navigator.platform,
    window.navigator.userAgent,
    href,
  ]
}

function send(data) {
  const d = enc(JSON.stringify(data))
  console.log(d)
  return fetch(config.apiUrl, {
    method: 'post',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({d}),
  })
}

async function start() {
  const visitorId = await getFingerprint()

  if (!visitorId) {
    return
  }

  locationPuller((href) => {
    send(takeD(visitorId, href))
  })
  send(takeD(visitorId, window.location.href))
}

start()
