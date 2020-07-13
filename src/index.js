import Fingerprint2 from 'fingerprintjs2'

const config = {
  sendInterval: 10000,
  apiUrl: 'http://localhost:3000/api/activities/add',
}

const cash = {
  fingerprint: null,
  activities: [],
}

const fpConfig = {
  fonts: {extendedJsFonts: true},
}

function getFingerprint() {
  return new Promise((done) => {
    if (window.requestIdleCallback) {
      requestIdleCallback(() => {
        Fingerprint2.getV18(fpConfig, (hash, components) => {
          done({hash, components})
        })
      })
    } else {
      setTimeout(() => {
        Fingerprint2.getV18(fpConfig, (hash, components) => {
          done({hash, components})
        })
      }, 500)
    }
  })
}

function cssPath(el) {
  if (!(el instanceof Element)) return
  const path = []
  while (el.nodeType === Node.ELEMENT_NODE) {
    let selector = el.nodeName.toLowerCase()
    if (el.id) {
      selector += '#' + el.id
    } else {
      let sib = el
      let nth = 1
      while (sib.nodeType === Node.ELEMENT_NODE && (sib = sib.previousSibling) && nth++) {
        selector += ':nth-child(' + nth + ')'
      }
    }
    path.unshift(selector)
    el = el.parentNode
  }
  return path.join(' > ')
}

function sender() {
  if (!cash.activities.length) {
    return
  }

  fetch(config.apiUrl, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(cash),
  })
    .catch((err) => console.log(err))
    .finally(() => {
      console.dir('send cash', cash)
      cash.activities = []
    })
}

function startSender() {
  setInterval(sender, config.sendInterval)
}

async function start() {
  const fingerprint = await getFingerprint()
  console.log(fingerprint)

  if (!fingerprint || !fingerprint.hash) {
    return
  }
  cash.fingerprint = fingerprint.hash

  startSender()

  document.addEventListener('click', ((event) => {
    const data = {
      click_x: event.clientX,
      click_y: event.clientY,
      screen_width: window.screen.width,
      orientation: window.screen.orientation.type,
      scroll_x: window.scrollX,
      scroll_y: window.scrollY,
      elem_tag: event.target.nodeName,
      elem_selector: '',
      page_uri: window.location.href,
      elem_x: 0,
      elem_y: 0,
    }

    cash.activities.push(data)
    console.log(event)
  }))
}

document.addEventListener('DOMContentLoaded', start)
