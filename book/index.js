const app = document.querySelector('.app')
const pages = Array.from(document.querySelectorAll('.page'))
pages.forEach((page, index)=>page.style.zIndex = pages.length - index)

const pageWidth = pages[0].offsetWidth

const dragState = {x: 0, vel: null, lastX: null}

;(function anim(){
  const location = -dragState.x/pageWidth
  const closestPage = Math.min(Math.max(0, Math.round(location)), pages.length-1)
  if (dragState.vel === null || dragState.vel !== 0 || location !== closestPage) {
    const location = -dragState.x/pageWidth
    if (dragState.lastX === null) {
      const pull = (location - closestPage)*50
      dragState.vel += pull
      dragState.vel *= .5
    } else {
      dragState.vel *= .9
    }
    const panelIndex = Math.floor(location)
    const panelOffset = (location - panelIndex) * pageWidth
    pages.forEach((page, index)=>{
      if (index < panelIndex)
          page.style.transform = `translateX(-200%)`
      else if (index > panelIndex)
        page.style.transform = `translateX(${(pageWidth-panelOffset)/3}px) translateZ(${-(pageWidth-panelOffset)/3}px) rotateY(${-((pageWidth-panelOffset)/pageWidth)*30}deg)`
      else
        page.style.transform = `translateX(${-panelOffset}px)`
    })

    dragState.x += dragState.vel
    dragState.x = Math.min(0, dragState.x)
    dragState.x = Math.max(-pageWidth * (pages.length-1), dragState.x)
    if (Math.abs(dragState.vel) < .01) dragState.vel = 0
  }
  window.requestAnimationFrame(anim)
})()

const onMouseDown = (e)=>{
  e.stopPropagation()
  e.stopImmediatePropagation()
  dragState.lastX = (e.touches ? e.touches[0] : e).screenX
}

const onMouseMove = (e)=>{
  if (dragState.lastX !== null) {
    e.preventDefault()
    e.stopPropagation()
    e.stopImmediatePropagation()
    const startX = dragState.lastX
    const x = (e.touches ? e.touches[0] : e).screenX
    dragState.lastX = x
    dragState.vel = x-startX
  }
}

const onMouseUp = (e)=>{
  dragState.lastX = null
}

document.addEventListener('mousedown',onMouseDown)
document.addEventListener('touchstart',onMouseDown)
document.addEventListener('mousemove',onMouseMove)
document.addEventListener('touchmove',onMouseMove)
document.addEventListener('mouseup',onMouseUp)
document.addEventListener('touchend',onMouseUp)
