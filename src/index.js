import FingerprintJS from '@fingerprintjs/fingerprintjs'

const config = {
  apiUrl: API_URL,
  basicToken: B_TOKEN,
  sendInterval: 10000,
}
const storage = {
  visitorId: null,
  token: config.basicToken,
  items: [],
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

function takeD(href) {
  return [
    window.screen.width,
    window.screen.orientation.type,
    Date.now(),
    window.navigator.language,
    window.navigator.platform,
    window.navigator.userAgent,
    href,
    window.navigator.hardwareConcurrency,
  ]
}

function send(data) {
  const strData = enc(JSON.stringify(data))
  window.navigator.sendBeacon(config.apiUrl, strData)
  storage.items = []
}

function startCycle(cb) {
  const pullInterval = 100
  let oldHref = window.location.href
  let counter = 0

  return setInterval(() => {
    if (oldHref !== window.location.href) {
      oldHref = window.location.href
      cb(window.location.href)
    }
    if (counter++ >= config.sendInterval / pullInterval) {
      if (storage.items.length) {
        send(storage)
      }

      counter = 0
    }
  }, pullInterval)
}

async function start() {
  try {
    storage.visitorId = await getFingerprint()

    if (storage.visitorId) {
      const intervalID = startCycle((href) => {
        storage.items.push(takeD(href))
      })

      window.addEventListener('beforeunload', () => {
        if (storage.items.length) {
          send(storage)
        }

        clearInterval(intervalID)
      })

      storage.items.push(takeD(window.location.href))
    }
  } catch (e) { // eslint-disable-next-line no-empty
  }
}

start()
