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

function animate(
  onNewFrame: (start: number, elapsed: number, setDone: (value: boolean) => void) => void,
  onEnd: () => void,
  maxDuration: number,
) {
  return new Promise<void>((resolve) => {
    let start: DOMHighResTimeStamp | undefined, previousTimeStamp: DOMHighResTimeStamp | undefined
    let done = false

    function setDone(value: boolean) {
      done = value
    }

    function step(timestamp: DOMHighResTimeStamp) {
      if (start === undefined) {
        start = timestamp
      }
      const elapsed = timestamp - start

      if (previousTimeStamp !== timestamp) {
        onNewFrame(start, elapsed, setDone)
      }

      if (elapsed < maxDuration) {
        // Stop the animation after 1 second
        previousTimeStamp = timestamp
        if (!done) {
          window.requestAnimationFrame(step)
        } else {
          onEnd()
          resolve()
        }
      }
    }

    window.requestAnimationFrame(step)
  })
}

export function animateSlideFromRight(paneElement: HTMLElement) {
  paneElement.style.display = 'flex'
  paneElement.style.transform = 'translateX(100%)'

  return animate(
    (_, elapsed, setDone) => {
      const count = 100 - Math.min(0.85 * elapsed, 100)
      paneElement.style.transform = `translateX(${count}%)`
      paneElement.style.opacity = Math.min(0.01 * elapsed, 1).toString()
      if (count === 0) {
        setDone(true)
      }
    },
    () => {
      paneElement.style.display = ''
      paneElement.style.transform = ''
      paneElement.style.opacity = ''
    },
    1000,
  )
}

export function animateSlideFromLeft(paneElement: HTMLElement) {
  paneElement.style.transform = 'translateX(-100%)'

  return animate(
    (_, elapsed, setDone) => {
      const count = 100 - Math.min(0.85 * elapsed, 100)
      paneElement.style.transform = `translateX(-${count}%)`
      paneElement.style.opacity = Math.min(0.01 * elapsed, 1).toString()
      if (count === 0) {
        setDone(true)
      }
    },
    () => {
      paneElement.style.transform = ''
      paneElement.style.opacity = ''
    },
    1000,
  )
}

export function animateSlideToLeft(paneElement: HTMLElement) {
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

  return animate(
    (_, elapsed, setDone) => {
      const count = Math.min(0.85 * elapsed, 100)
      paneElement.style.transform = `translateX(-${count}%)`
      if (count === 100) {
        setDone(true)
      }
    },
    () => {
      if (paneContent) {
        paneContent.style.display = ''
      }
      cleanupPaneElementStyles()
    },
    1000,
  )
}

export function animateSlideToRight(paneElement: HTMLElement) {
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

  return animate(
    (_, elapsed, setDone) => {
      const count = Math.min(0.85 * elapsed, 100)
      paneElement.style.transform = `translateX(${count}%)`
      if (count === 100) {
        setDone(true)
      }
    },
    () => {
      if (paneContent) {
        paneContent.style.display = ''
      }
      cleanupPaneElementStyles()
    },
    1000,
  )
}
