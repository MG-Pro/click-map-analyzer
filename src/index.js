import Fingerprint2 from 'fingerprintjs2'

const config = {
  sendInterval: 10000,
  apiUrl: 'http://localhost:3000/api/activities/add',
  fingerprint: {fonts: {extendedJsFonts: true}},
}

const cash = {
  fingerprint: null,
  activities: [],
}

function getFingerprint() {
  return new Promise((done) => {
    if (window.requestIdleCallback) {
      requestIdleCallback(() => {
        Fingerprint2.getV18(config.fingerprint, (hash, components) => {
          done({hash, components})
        })
      })
    } else {
      setTimeout(() => {
        Fingerprint2.getV18(config.fingerprint, (hash, components) => {
          done({hash, components})
        })
      }, 500)
    }
  })
}

const getCssSelector = (el) => {
  const path = []
  let parent = el.parentNode

  while (parent && el !== document.documentElement) {
    const selector = el.id ? '#' + el.id : `${el.tagName}:nth-child(${[].indexOf.call(parent.children, el) + 1})`
    path.unshift(selector)
    el = parent
    parent = el.parentNode
  }
  return `${path.join('>')}`.toLowerCase()
}

function sender() {
  if (!cash.activities.length) {
    return
  }

  fetch(config.apiUrl, {
    method: 'post',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(cash),
  })
    .catch((err) => console.log(err))
    .finally(() => {
      console.dir('cash sent', cash)
      cash.activities = []
    })
}

function startSender() {
  setInterval(sender, config.sendInterval)
}

async function start() {
  const fingerprint = await getFingerprint()

  if (!fingerprint || !fingerprint.hash) {
    return
  }
  cash.fingerprint = fingerprint.hash

  document.addEventListener('click', ((event) => {
    const {left, top, width, height} = event.target.getBoundingClientRect()
    const selector = getCssSelector(event.target)

    const data = {
      click_x: event.clientX,
      click_y: event.clientY,
      screen_width: window.screen.width,
      orientation: window.screen.orientation.type,
      scroll_x: window.scrollX,
      scroll_y: window.scrollY,
      elem_tag: event.target.nodeName,
      elem_selector: selector,
      page_uri: window.location.href,
      elem_x: left + window.scrollX,
      elem_y: top + window.scrollY,
      timestamp: Date.now(),
      elem_width: width,
      elem_height: height,

    }

    cash.activities.push(data)
    console.log(data)
  }))

  startSender()
}

document.addEventListener('DOMContentLoaded', start)
