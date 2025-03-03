import { WebApplication } from '@/Application/Application'
import { concatenateUint8Arrays } from '@/Utils'
import { ApplicationEvent, FileItem } from '@standardnotes/snjs'
import { useEffect, useMemo, useState } from 'react'
import Spinner from '@/Components/Spinner/Spinner'
import FilePreviewError from './FilePreviewError'
import { isFileTypePreviewable } from './isFilePreviewable'
import PreviewComponent from './PreviewComponent'
import ProtectedItemOverlay from '../ProtectedItemOverlay/ProtectedItemOverlay'

type Props = {
  application: WebApplication
  file: FileItem
}

const FilePreview = ({ file, application }: Props) => {
  const [isAuthorized, setIsAuthorized] = useState(application.isAuthorizedToRenderItem(file))

  const isFilePreviewable = useMemo(() => {
    return isFileTypePreviewable(file.mimeType)
  }, [file.mimeType])

  const [isDownloading, setIsDownloading] = useState(true)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [downloadedBytes, setDownloadedBytes] = useState<Uint8Array>()

  useEffect(() => {
    setIsAuthorized(application.isAuthorizedToRenderItem(file))
  }, [file.protected, application, file])

  useEffect(() => {
    const disposer = application.addEventObserver(async (event) => {
      if (event === ApplicationEvent.UnprotectedSessionBegan) {
        setIsAuthorized(true)
      } else if (event === ApplicationEvent.UnprotectedSessionExpired) {
        setIsAuthorized(application.isAuthorizedToRenderItem(file))
      }
    })

    return disposer
  }, [application, file])

  useEffect(() => {
    if (!isFilePreviewable || !isAuthorized) {
      setIsDownloading(false)
      setDownloadProgress(0)
      setDownloadedBytes(undefined)
      return
    }

    const downloadFileForPreview = async () => {
      if (downloadedBytes) {
        return
      }

      setIsDownloading(true)

      try {
        const chunks: Uint8Array[] = []
        setDownloadProgress(0)
        await application.files.downloadFile(file, async (decryptedChunk, progress) => {
          chunks.push(decryptedChunk)
          if (progress) {
            setDownloadProgress(Math.round(progress.percentComplete))
          }
        })
        const finalDecryptedBytes = concatenateUint8Arrays(chunks)
        setDownloadedBytes(finalDecryptedBytes)
      } catch (error) {
        console.error(error)
      } finally {
        setIsDownloading(false)
      }
    }

    void downloadFileForPreview()
  }, [application.files, downloadedBytes, file, isFilePreviewable, isAuthorized])

  if (!isAuthorized) {
    return (
      <ProtectedItemOverlay
        showAccountMenu={application.showAccountMenu}
        itemType={'file'}
        onViewItem={() => application.protections.authorizeItemAccess(file)}
        hasProtectionSources={application.hasProtectionSources()}
      />
    )
  }

  return isDownloading ? (
    <div className="flex flex-grow flex-col items-center justify-center">
      <div className="flex items-center">
        <Spinner className="mr-3 h-5 w-5" />
        <div className="text-base font-semibold">{downloadProgress}%</div>
      </div>
      <span className="mt-3">Loading file...</span>
    </div>
  ) : downloadedBytes ? (
    <PreviewComponent application={application} file={file} bytes={downloadedBytes} />
  ) : (
    <FilePreviewError
      file={file}
      filesController={application.getViewControllerManager().filesController}
      tryAgainCallback={() => {
        setDownloadedBytes(undefined)
      }}
      isFilePreviewable={isFilePreviewable}
    />
  )
}

export default FilePreview
