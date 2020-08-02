import Fingerprint2 from 'fingerprintjs2'

const config = {
  interceptClickHandlers: false,
  showVisual: true,
  sendInterval: 10000,
  apiUrl: 'http://localhost:3000/api/activities/add',
  apiSec: 'CE68C8072A0A71863350CFB1BED8349CAD41672E',
  fingerprint: {fonts: {extendedJsFonts: true}},
  targetTags: [
    'BUTTON',
    'A',
  ],
}

const cash = {
  fingerprint: null,
  activities: [],
  apiSec: config.apiSec,
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

function getCssSelector(el) {
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

function visualRect(x, y, dx, dy) {
  const div = document.createElement('div')
  div.style.position = 'absolute'
  div.style.background = 'rgb(212 209 104 / 35%)'
  div.classList.add('visual-box')
  div.style.width = `${dx - x}px`
  div.style.height = `${dy - y}px`
  div.style.left = `${x}px`
  div.style.top = `${y}px`
  document.body.append(div)

  setTimeout(() => {
    div.remove()
  }, 5000)
}

function findNearestElems(points, scrollX, scrollY, targetElem) {
  const acc = []

  points.forEach((row) => {
    row.forEach((point) => {
      Array
        .from(document.elementsFromPoint(point.x - scrollX, point.y - scrollY))
        .forEach((elem) => {
          if (
            elem !== targetElem
            && config.targetTags.includes(elem.nodeName)
            && !acc.includes(elem)
          ) {
            acc.push(elem)
          }
        })
    })
  })
  return acc
}

function defineRectangle(x, y, scrollX, scrollY, width = 100, height = 100, step = 10) {
  const startX = (x - Math.round(width / 2) - step) + scrollX
  let startY = (y - Math.round(height / 2) - step * 3) + scrollY

  const stepsX = Math.round(width / step) + 1
  const stepsY = Math.round(height / step) + 1

  const points = Array(stepsY).fill(null)
    .map(() => {
      let colX = startX
      startY += step
      return Array(stepsX).fill(null)
        .map(() => {
          return {
            x: colX += step,
            y: startY,
          }
        })
    })
  if (config.showVisual) {
    const lastRow = points[points.length - 1]
    const lastCol = lastRow[lastRow.length - 1]
    visualRect(points[0][0].x, points[0][0].y, lastCol.x, lastCol.y)
  }
  return points
}

function enc(str) {
  return str.split('').reduce((acc, sym) => {
    acc += String.fromCharCode(sym.charCodeAt(0) ^ 123)
    return acc
  })
}

function sender() {
  if (!cash.activities.length) {
    return
  }

  const data = enc(JSON.stringify(cash))

  fetch(config.apiUrl, {
    method: 'post',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({data}),
  })
    .catch((err) => console.log(err))
    .finally(() => {
      cash.activities = []
    })
}

function startSender() {
  setInterval(sender, config.sendInterval)
}

function getElemData(scrollX, scrollY, elem) {
  const {left, top, width, height} = elem.getBoundingClientRect()
  return {
    selector: getCssSelector(elem),
    elemTag: elem.nodeName,
    elemX: left + scrollX,
    elemY: top + scrollY,
    width,
    height,
  }
}

async function start() {
  const fingerprint = await getFingerprint()

  if (!fingerprint || !fingerprint.hash) {
    return
  }
  cash.fingerprint = fingerprint.hash

  document.addEventListener('click', ((event) => {
    const {scrollX, scrollY, screen, location} = window
    const {clientX, clientY, target} = event

    const getElemDataXY = (elem) => {
      return getElemData(scrollX, scrollY, elem)
    }

    const points = defineRectangle(clientX, clientY, scrollX, scrollY)
    const nearestElems = findNearestElems(points, scrollX, scrollY, target)

    if (!nearestElems.length) {
      return
    }

    const targetElemData = getElemDataXY(target)
    const nearestElemsData = nearestElems.map((elem) => getElemDataXY(elem))

    const data = {
      click_x: clientX,
      click_y: clientY,
      screen_width: screen.width,
      orientation: screen.orientation.type,
      scroll_x: scrollX,
      scroll_y: scrollY,
      page_uri: location.href,
      timestamp: Date.now(),
      nearestElemsData,
      targetElemData,
    }
    cash.activities.push(data)
  }))

  startSender()
}

document.addEventListener('DOMContentLoaded', start)
