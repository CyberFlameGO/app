import { ElementIds } from '@/Constants/ElementIDs'
import { useAndroidBackHandler } from '@/NativeMobileWeb/useAndroidBackHandler'
import {
  useEffect,
  ReactNode,
  useMemo,
  createContext,
  useCallback,
  useContext,
  useState,
  memo,
  useRef,
  useLayoutEffect,
  MutableRefObject,
} from 'react'
import { AppPaneId } from './AppPaneMetadata'
import { PaneController } from '../../Controllers/PaneController'
import { observer } from 'mobx-react-lite'
import { MediaQueryBreakpoints } from '@/Hooks/useMediaQuery'
import {
  animateSlideFromRight,
  animateSlideFromLeft,
  animateSlideToRight,
  AvailableAnimations,
  PaneAction,
  PaneAnimations,
  animateSlideToLeft,
} from './Animation/PaneAnimations'

type ResponsivePaneData = {
  selectedPane: AppPaneId
  toggleAppPane: (paneId: AppPaneId) => void

  isNotesListVisibleOnTablets: boolean
  toggleNotesListOnTablets: () => void
}

const ResponsivePaneContext = createContext<ResponsivePaneData | undefined>(undefined)

export const useResponsiveAppPane = () => {
  const value = useContext(ResponsivePaneContext)

  if (!value) {
    throw new Error('Component must be a child of <ResponsivePaneProvider />')
  }

  return value
}

type ChildrenProps = {
  children: ReactNode
}

type ProviderProps = {
  paneController: PaneController
} & ChildrenProps

function useStateRef<State>(state: State): MutableRefObject<State> {
  const ref = useRef<State>(state)

  useLayoutEffect(() => {
    ref.current = state
  }, [state])

  return ref
}

const MemoizedChildren = memo(({ children }: ChildrenProps) => <>{children}</>)

const SelectedPaneAttributeName = 'data-selected-pane'

function setPaneAttributeFromAction(paneElement: HTMLElement, action: PaneAction) {
  if (action === 'select') {
    paneElement.setAttribute(SelectedPaneAttributeName, '')
  } else {
    paneElement.removeAttribute(SelectedPaneAttributeName)
  }
}

async function animatePane(paneElement: HTMLElement, animation: AvailableAnimations, paneAction: PaneAction) {
  switch (animation) {
    case 'slide-from-right':
      paneElement.style.opacity = '0'
      setPaneAttributeFromAction(paneElement, paneAction)
      await animateSlideFromRight(paneElement)
      break
    case 'slide-from-left':
      paneElement.style.opacity = '0'
      setPaneAttributeFromAction(paneElement, paneAction)
      await animateSlideFromLeft(paneElement)
      break
    case 'slide-to-right':
      await animateSlideToRight(paneElement)
      setPaneAttributeFromAction(paneElement, paneAction)
      break
    case 'slide-to-left':
      await animateSlideToLeft(paneElement)
      setPaneAttributeFromAction(paneElement, paneAction)
      break
  }
}

const ResponsivePaneProvider = ({ paneController, children }: ProviderProps) => {
  const currentSelectedPane = paneController.currentPane
  const previousSelectedPane = paneController.previousPane
  const currentSelectedPaneRef = useStateRef<AppPaneId>(currentSelectedPane)

  const toggleAppPane = useCallback(
    (paneId: AppPaneId) => {
      paneController.setPreviousPane(currentSelectedPane)
      paneController.setCurrentPane(paneId)
    },
    [paneController, currentSelectedPane],
  )

  useEffect(() => {
    const handlePaneChange = async () => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const isMobileScreen = window.matchMedia(MediaQueryBreakpoints.sm).matches
      const canAnimate = isMobileScreen && !prefersReducedMotion

      if (previousSelectedPane) {
        const previousPaneElement = document.getElementById(ElementIds[previousSelectedPane])

        const shouldAnimate = previousPaneElement && PaneAnimations[ElementIds[previousSelectedPane]] && canAnimate
        if (shouldAnimate) {
          paneController.setAnimatingPane(previousSelectedPane)
          await animatePane(previousPaneElement, PaneAnimations[ElementIds[previousSelectedPane]].unselect, 'unselect')
          paneController.setAnimatingPane(null)
        } else {
          previousPaneElement?.removeAttribute(SelectedPaneAttributeName)
        }
      }

      const currentPaneElement = document.getElementById(ElementIds[currentSelectedPane])

      const shouldAnimate = currentPaneElement && PaneAnimations[ElementIds[currentSelectedPane]] && canAnimate
      if (shouldAnimate) {
        paneController.setAnimatingPane(currentSelectedPane)
        await animatePane(currentPaneElement, PaneAnimations[ElementIds[currentSelectedPane]].select, 'select')
        paneController.setAnimatingPane(null)
      } else {
        currentPaneElement?.setAttribute(SelectedPaneAttributeName, '')
      }
    }

    void handlePaneChange()
  }, [currentSelectedPane, paneController, previousSelectedPane])

  const addAndroidBackHandler = useAndroidBackHandler()

  useEffect(() => {
    const removeListener = addAndroidBackHandler(() => {
      if (
        currentSelectedPaneRef.current === AppPaneId.Editor ||
        currentSelectedPaneRef.current === AppPaneId.Navigation
      ) {
        toggleAppPane(AppPaneId.Items)
        return true
      } else {
        return false
      }
    })
    return () => {
      if (removeListener) {
        removeListener()
      }
    }
  }, [addAndroidBackHandler, currentSelectedPaneRef, toggleAppPane])

  const [isNotesListVisibleOnTablets, setNotesListVisibleOnTablets] = useState(true)

  const toggleNotesListOnTablets = useCallback(() => {
    setNotesListVisibleOnTablets((visible) => !visible)
  }, [])

  const contextValue = useMemo(
    () => ({
      selectedPane: currentSelectedPane,
      toggleAppPane,
      isNotesListVisibleOnTablets,
      toggleNotesListOnTablets,
    }),
    [currentSelectedPane, isNotesListVisibleOnTablets, toggleAppPane, toggleNotesListOnTablets],
  )

  return (
    <ResponsivePaneContext.Provider value={contextValue}>
      <MemoizedChildren children={children} />
    </ResponsivePaneContext.Provider>
  )
}

export default observer(ResponsivePaneProvider)
