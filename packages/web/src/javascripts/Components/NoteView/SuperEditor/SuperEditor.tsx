import { WebApplication } from '@/Application/Application'
import { isPayloadSourceRetrieved } from '@standardnotes/snjs'
import { FunctionComponent, useCallback, useEffect, useRef } from 'react'
import { BlocksEditor, BlocksEditorComposer } from '@standardnotes/blocks-editor'
import { ItemSelectionPlugin } from './Plugins/ItemSelectionPlugin/ItemSelectionPlugin'
import { FileNode } from './Plugins/EncryptedFilePlugin/Nodes/FileNode'
import FilePlugin from './Plugins/EncryptedFilePlugin/FilePlugin'
import BlockPickerMenuPlugin from './Plugins/BlockPickerPlugin/BlockPickerPlugin'
import { ErrorBoundary } from '@/Utils/ErrorBoundary'
import { LinkingController } from '@/Controllers/LinkingController'
import LinkingControllerProvider from '../../../Controllers/LinkingControllerProvider'
import { BubbleNode } from './Plugins/ItemBubblePlugin/Nodes/BubbleNode'
import ItemBubblePlugin from './Plugins/ItemBubblePlugin/ItemBubblePlugin'
import { NodeObserverPlugin } from './Plugins/NodeObserverPlugin/NodeObserverPlugin'
import { FilesController } from '@/Controllers/FilesController'
import FilesControllerProvider from '@/Controllers/FilesControllerProvider'
import DatetimePlugin from './Plugins/DateTimePlugin/DateTimePlugin'
import AutoLinkPlugin from './Plugins/AutoLinkPlugin/AutoLinkPlugin'
import { NoteViewController } from '../Controller/NoteViewController'
import {
  ChangeContentCallbackPlugin,
  ChangeEditorFunction,
} from './Plugins/ChangeContentCallback/ChangeContentCallback'
import PasswordPlugin from './Plugins/PasswordPlugin/PasswordPlugin'

const NotePreviewCharLimit = 160

type Props = {
  application: WebApplication
  controller: NoteViewController
  linkingController: LinkingController
  filesController: FilesController
  spellcheck: boolean
}

export const SuperEditor: FunctionComponent<Props> = ({
  application,
  linkingController,
  filesController,
  spellcheck,
  controller,
}) => {
  const note = useRef(controller.item)
  const changeEditorFunction = useRef<ChangeEditorFunction>()
  const ignoreNextChange = useRef(false)

  const handleChange = useCallback(
    async (value: string, preview: string) => {
      if (ignoreNextChange.current === true) {
        ignoreNextChange.current = false
        return
      }

      void controller.saveAndAwaitLocalPropagation({
        text: value,
        isUserModified: true,
        previews: {
          previewPlain: preview,
          previewHtml: undefined,
        },
      })
    },
    [controller],
  )

  const handleBubbleRemove = useCallback(
    (itemUuid: string) => {
      const item = application.items.findItem(itemUuid)
      if (item) {
        linkingController.unlinkItemFromSelectedItem(item).catch(console.error)
      }
    },
    [linkingController, application],
  )

  useEffect(() => {
    const disposer = controller.addNoteInnerValueChangeObserver((updatedNote, source) => {
      if (updatedNote.uuid !== note.current.uuid) {
        throw Error('Editor received changes for non-current note')
      }

      if (isPayloadSourceRetrieved(source)) {
        ignoreNextChange.current = true
        changeEditorFunction.current?.(updatedNote.text)
      }

      note.current = updatedNote
    })

    return disposer
  }, [controller, controller.item.uuid])

  return (
    <div className="relative h-full w-full">
      <ErrorBoundary>
        <LinkingControllerProvider controller={linkingController}>
          <FilesControllerProvider controller={filesController}>
            <BlocksEditorComposer
              readonly={note.current.locked}
              initialValue={note.current.text}
              nodes={[FileNode, BubbleNode]}
            >
              <BlocksEditor
                onChange={handleChange}
                ignoreFirstChange={true}
                className="relative h-full resize-none px-6 py-4 text-base focus:shadow-none focus:outline-none"
                previewLength={NotePreviewCharLimit}
                spellcheck={spellcheck}
              >
                <ItemSelectionPlugin currentNote={note.current} />
                <FilePlugin />
                <ItemBubblePlugin />
                <BlockPickerMenuPlugin />
                <DatetimePlugin />
                <PasswordPlugin />
                <AutoLinkPlugin />
                <ChangeContentCallbackPlugin
                  providerCallback={(callback) => (changeEditorFunction.current = callback)}
                />
                <NodeObserverPlugin nodeType={BubbleNode} onRemove={handleBubbleRemove} />
                <NodeObserverPlugin nodeType={FileNode} onRemove={handleBubbleRemove} />
              </BlocksEditor>
            </BlocksEditorComposer>
          </FilesControllerProvider>
        </LinkingControllerProvider>
      </ErrorBoundary>
    </div>
  )
}
