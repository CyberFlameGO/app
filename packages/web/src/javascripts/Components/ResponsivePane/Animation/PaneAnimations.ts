import { ElementIds } from '@/Constants/ElementIDs'
import { setElementStylesWithCleanup } from './Utils'

export type PaneAction = 'select' | 'unselect'

export type AvailableAnimations = 'slide-from-right' | 'slide-to-right' | 'slide-from-left' | 'slide-to-left'

export const PaneAnimations: Record<string, Record<PaneAction, AvailableAnimations>> = {
  [ElementIds.EditorColumn]: {
    select: 'slide-from-right',
    unselect: 'slide-to-right',
  },
  [ElementIds.NavigationColumn]: {
    select: 'slide-from-left',
    unselect: 'slide-to-left',
  },
}

export function animateSlideFromRight(paneElement: HTMLElement) {
  return new Promise<void>((resolve) => {
    let start: DOMHighResTimeStamp | undefined, previousTimeStamp: DOMHighResTimeStamp | undefined
    let done = false

    paneElement.style.display = 'flex'
    paneElement.style.transform = 'translateX(100%)'

    function step(timestamp: DOMHighResTimeStamp) {
      if (start === undefined) {
        start = timestamp
      }
      const elapsed = timestamp - start

      if (previousTimeStamp !== timestamp) {
        // Math.min() is used here to make sure the element stops at exactly 200px
        const count = 100 - Math.min(0.85 * elapsed, 100)
        paneElement.style.transform = `translateX(${count}%)`
        paneElement.style.opacity = Math.min(0.01 * elapsed, 1).toString()
        if (count === 0) {
          done = true
        }
      }

      if (elapsed < 1000) {
        // Stop the animation after 1 second
        previousTimeStamp = timestamp
        if (!done) {
          window.requestAnimationFrame(step)
        } else {
          paneElement.style.display = ''
          paneElement.style.transform = ''
          paneElement.style.opacity = ''
          resolve()
        }
      }
    }

    window.requestAnimationFrame(step)
  })
}

export function animateSlideFromLeft(paneElement: HTMLElement) {
  return new Promise<void>((resolve) => {
    let start: DOMHighResTimeStamp | undefined, previousTimeStamp: DOMHighResTimeStamp | undefined
    let done = false

    paneElement.style.transform = 'translateX(-100%)'

    function step(timestamp: DOMHighResTimeStamp) {
      if (start === undefined) {
        start = timestamp
      }
      const elapsed = timestamp - start

      if (previousTimeStamp !== timestamp) {
        // Math.min() is used here to make sure the element stops at exactly 200px
        const count = 100 - Math.min(0.85 * elapsed, 100)
        paneElement.style.transform = `translateX(-${count}%)`
        paneElement.style.opacity = Math.min(0.01 * elapsed, 1).toString()
        if (count === 0) {
          done = true
        }
      }

      if (elapsed < 1000) {
        // Stop the animation after 1 second
        previousTimeStamp = timestamp
        if (!done) {
          window.requestAnimationFrame(step)
        } else {
          paneElement.style.transform = ''
          paneElement.style.opacity = ''
          resolve()
        }
      }
    }

    window.requestAnimationFrame(step)
  })
}

export function animateSlideToLeft(paneElement: HTMLElement) {
  return new Promise<void>((resolve) => {
    let start: DOMHighResTimeStamp | undefined, previousTimeStamp: DOMHighResTimeStamp | undefined
    let done = false

    const paneContent = paneElement.querySelector<HTMLDivElement>('[data-responsive-pane-content]')

    if (paneContent) {
      paneContent.style.display = 'flex'
    }
    const cleanupPaneElementStyles = setElementStylesWithCleanup(paneElement, {
      display: 'flex',
      position: 'absolute',
      top: '0',
      left: '0',
      width: `${visualViewport ? visualViewport.width : window.innerWidth}px`,
      height: `${visualViewport ? visualViewport.height : window.innerHeight}px`,
      zIndex: '100000',
      transform: 'translateX(0%)',
      opacity: '1',
    })

    function step(timestamp: DOMHighResTimeStamp) {
      if (start === undefined) {
        start = timestamp
      }
      const elapsed = timestamp - start

      if (previousTimeStamp !== timestamp) {
        // Math.min() is used here to make sure the element stops at exactly 200px
        const count = Math.min(0.85 * elapsed, 100)
        paneElement.style.transform = `translateX(-${count}%)`
        if (count === 100) {
          done = true
        }
      }

      if (elapsed < 1000) {
        // Stop the animation after 1 second
        previousTimeStamp = timestamp
        if (!done) {
          window.requestAnimationFrame(step)
        } else {
          if (paneContent) {
            paneContent.style.display = ''
          }
          cleanupPaneElementStyles()
          resolve()
        }
      } else {
        resolve()
      }
    }

    window.requestAnimationFrame(step)
  })
}

export function animateSlideToRight(paneElement: HTMLElement) {
  return new Promise<void>((resolve) => {
    let start: DOMHighResTimeStamp | undefined, previousTimeStamp: DOMHighResTimeStamp | undefined
    let done = false

    const paneContent = paneElement.querySelector<HTMLDivElement>('[data-responsive-pane-content]')

    if (paneContent) {
      paneContent.style.display = 'flex'
    }
    const cleanupPaneElementStyles = setElementStylesWithCleanup(paneElement, {
      display: 'flex',
      position: 'absolute',
      top: '0',
      left: '0',
      width: `${visualViewport ? visualViewport.width : window.innerWidth}px`,
      height: `${visualViewport ? visualViewport.height : window.innerHeight}px`,
      zIndex: '100000',
      transform: 'translateX(0%)',
    })

    function step(timestamp: DOMHighResTimeStamp) {
      if (start === undefined) {
        start = timestamp
      }
      const elapsed = timestamp - start

      if (previousTimeStamp !== timestamp) {
        // Math.min() is used here to make sure the element stops at exactly 200px
        const count = Math.min(0.85 * elapsed, 100)
        paneElement.style.transform = `translateX(${count}%)`
        // currentPaneElement.style.opacity = Math.min(0.01 * elapsed, 1).toString()
        if (count === 100) {
          done = true
        }
      }

      if (elapsed < 1000) {
        // Stop the animation after 1 second
        previousTimeStamp = timestamp
        if (!done) {
          window.requestAnimationFrame(step)
        } else {
          if (paneContent) {
            paneContent.style.display = ''
          }
          cleanupPaneElementStyles()
          resolve()
        }
      } else {
        resolve()
      }
    }

    window.requestAnimationFrame(step)
  })
}
