import SmartViewsSection from '@/Components/Tags/SmartViewsSection'
import TagsSection from '@/Components/Tags/TagsSection'
import { WebApplication } from '@/Application/Application'
import { PANEL_NAME_NAVIGATION } from '@/Constants/Constants'
import { ApplicationEvent, PrefKey } from '@standardnotes/snjs'
import { observer } from 'mobx-react-lite'
import { FunctionComponent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import PanelResizer, { PanelSide, ResizeFinishCallback, PanelResizeType } from '@/Components/PanelResizer/PanelResizer'
import SearchBar from '@/Components/SearchBar/SearchBar'
import ResponsivePaneContent from '@/Components/ResponsivePane/ResponsivePaneContent'
import { AppPaneId } from '@/Components/ResponsivePane/AppPaneMetadata'
import { classNames } from '@/Utils/ConcatenateClassNames'
import styled from 'styled-components'

type Props = {
  application: WebApplication
}

const ItemsColumnStyled = styled.div<{ left?: any; width?: any }>`
  left: ${(props) => (props.left !== undefined ? props.left : 'unset')};
  width: ${(props) => (props.width !== undefined ? `${props.width}px` : 'unset')};
`

const Navigation: FunctionComponent<Props> = ({ application }) => {
  const viewControllerManager = useMemo(() => application.getViewControllerManager(), [application])
  const ref = useRef<HTMLDivElement>(null)
  const [panelWidth, setPanelWidth] = useState<number>(0)

  const [resizerWidth, setResizerWidth] = useState(panelWidth)

  const handleResizerWidthUpdate = (newWidth: any) => {
    const numericWidth = parseInt(newWidth)
    if (Number.isNaN(numericWidth)) {
      // setResizerWidth('unset')
      // setPanelWidth('unset')
    } else {
      // setResizerWidth(numericWidth)
      // setPanelWidth(numericWidth)
    }
  }

  useEffect(() => {
    const removeObserver = application.addEventObserver(async () => {
      const width = application.getPreference(PrefKey.TagsPanelWidth)
      if (width) {
        setPanelWidth(width)
      }
    }, ApplicationEvent.PreferencesChanged)

    return () => {
      removeObserver()
    }
  }, [application])

  const panelResizeFinishCallback: ResizeFinishCallback = useCallback(
    (width, _lastLeft, _isMaxWidth, isCollapsed) => {
      application.setPreference(PrefKey.TagsPanelWidth, width).catch(console.error)
      viewControllerManager.noteTagsController.reloadTagsContainerMaxWidth()
      application.publishPanelDidResizeEvent(PANEL_NAME_NAVIGATION, isCollapsed)
    },
    [application, viewControllerManager],
  )

  const panelWidthEventCallback = useCallback(() => {
    viewControllerManager.noteTagsController.reloadTagsContainerMaxWidth()
  }, [viewControllerManager])

  return (
    // <div id="navigation" className="sn-component section app-column app-column-first" ref={ref}>
    <ItemsColumnStyled
      id="navigation"
      className="sn-component section app-column app-column-first"
      ref={ref}
      // width={resizerWidth}
      // width={panelWidth}
    >
      <ResponsivePaneContent paneId={AppPaneId.Navigation} contentElementId="navigation-content">
        <SearchBar
          itemListController={viewControllerManager.itemListController}
          searchOptionsController={viewControllerManager.searchOptionsController}
          selectedViewTitle={viewControllerManager.navigationController.selected?.title}
        />
        <div className="section-title-bar">
          <div className="section-title-bar-header">
            <div className="title text-sm">
              <span className="font-bold">Views</span>
            </div>
          </div>
        </div>
        <div
          className={classNames(
            'h-full overflow-y-auto overflow-x-hidden',
            'md:overflow-y-hidden md:hover:overflow-y-auto',
            'md:hover:[overflow-y:_overlay]',
          )}
        >
          <SmartViewsSection viewControllerManager={viewControllerManager} />
          <TagsSection viewControllerManager={viewControllerManager} />
        </div>
      </ResponsivePaneContent>
      {ref.current && (
        <PanelResizer
          collapsable={true}
          defaultWidth={150}
          panel={ref.current}
          hoverable={true}
          side={PanelSide.Right}
          type={PanelResizeType.WidthOnly}
          resizeFinishCallback={panelResizeFinishCallback}
          widthEventCallback={panelWidthEventCallback}
          width={panelWidth}
          // width={resizerWidth}
          left={0}
          // updateWidth={(newWidth) => handleResizerWidthUpdate(newWidth)}
          updateWidth={(newWidth) => {
            handleResizerWidthUpdate(newWidth);
            panelWidthEventCallback()
          }}
          updateLeft={() => {}}
        />
      )}
    </ItemsColumnStyled>
  )
}

export default observer(Navigation)
