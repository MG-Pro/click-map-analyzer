import Fingerprint2 from 'fingerprintjs2'

const config = {
  showVisual: true,
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
    // div.remove()
  }, 5000)
}

function findNearestElems(points) {
  const acc = []

  points.forEach((row) => {
    row.forEach((point) => {
      const elems = document.elementsFromPoint(point.x, point.y)
      Array.from(elems).forEach((elem) => {
        if (elem.nodeName === 'BUTTON') {
          const isExist = acc.includes(elem)
          acc.push(elem)
        }
      })
    })
  })

  console.log(acc)
}

function defineRectangle(x, y, width = 100, height = 50, step = 10) {
  const startX = x - Math.round(width / 2) - step
  let startY = y - Math.round(height / 2) - step * 3

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
  console.log(points)
  if (config.showVisual) {
    const lastRow = points[points.length - 1]
    const lastCol = lastRow[lastRow.length - 1]
    visualRect(points[0][0].x, points[0][0].y, lastCol.x, lastCol.y)
  }
  return points
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
      console.log(JSON.stringify(cash))
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
    const {clientX, clientY, target} = event
    const {left, top, width, height} = target.getBoundingClientRect()
    const selector = getCssSelector(target)
    const points = defineRectangle(clientX, clientY)
    const nearestElems = findNearestElems(points)



    const data = {
      click_x: clientX,
      click_y: clientY,
      screen_width: window.screen.width,
      orientation: window.screen.orientation.type,
      scroll_x: window.scrollX,
      scroll_y: window.scrollY,
      elem_tag: target.nodeName,
      elem_selector: selector,
      page_uri: window.location.href,
      elem_x: left + window.scrollX,
      elem_y: top + window.scrollY,
      timestamp: Date.now(),
      elem_width: width,
      elem_height: height,
    }

    cash.activities.push(data)
  }))

  // startSender()
}

document.addEventListener('DOMContentLoaded', start)
