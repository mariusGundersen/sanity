import {BoundaryElementProvider, Box, Flex, PortalProvider, usePortal} from '@sanity/ui'
import {useEffect, useMemo, useRef, useState} from 'react'
import {
  getVersionFromId,
  isReleaseDocument,
  isReleaseScheduledOrScheduling,
  type ReleaseDocument,
  ScrollContainer,
  usePerspective,
  VirtualizerScrollInstanceProvider,
} from 'sanity'
import {css, styled} from 'styled-components'

import {PaneContent, usePane, usePaneLayout, usePaneRouter} from '../../../components'
import {isLiveEditEnabled} from '../../../components/paneItem/helpers'
import {useStructureTool} from '../../../useStructureTool'
import {DocumentInspectorPanel} from '../documentInspector'
import {InspectDialog} from '../inspectDialog'
import {useDocumentPane} from '../useDocumentPane'
import {
  DeletedDocumentBanners,
  DeprecatedDocumentTypeBanner,
  InsufficientPermissionBanner,
  ReferenceChangedBanner,
} from './banners'
import {AddToReleaseBanner} from './banners/AddToReleaseBanner'
import {ArchivedReleaseDocumentBanner} from './banners/ArchivedReleaseDocumentBanner'
import {DraftLiveEditBanner} from './banners/DraftLiveEditBanner'
import {ScheduledReleaseBanner} from './banners/ScheduledReleaseBanner'
import {UnpublishedDocumentBanner} from './banners/UnpublishedDocumentBanner'
import {FormView} from './documentViews'

interface DocumentPanelProps {
  footerHeight: number | null
  headerHeight: number | null
  isInspectOpen: boolean
  rootElement: HTMLDivElement | null
  setDocumentPanelPortalElement: (el: HTMLElement | null) => void
}

const DocumentBox = styled(Box)({
  position: 'relative',
})

const Scroller = styled(ScrollContainer)<{$disabled: boolean}>(({$disabled}) => {
  if ($disabled) {
    return {height: '100%'}
  }

  return css`
    height: 100%;
    overflow: auto;
    position: relative;
    scroll-behavior: smooth;
    outline: none;
  `
})

export const DocumentPanel = function DocumentPanel(props: DocumentPanelProps) {
  const {footerHeight, headerHeight, isInspectOpen, rootElement, setDocumentPanelPortalElement} =
    props
  const {
    activeViewId,
    displayed,
    documentId,
    editState,
    inspector,
    value,
    views,
    ready,
    schemaType,
    permissions,
    isPermissionsLoading,
  } = useDocumentPane()
  const {params} = usePaneRouter()
  const {collapsed: layoutCollapsed} = usePaneLayout()
  const {collapsed} = usePane()
  const parentPortal = usePortal()
  const {features} = useStructureTool()
  const [_portalElement, setPortalElement] = useState<HTMLDivElement | null>(null)
  const [documentScrollElement, setDocumentScrollElement] = useState<HTMLDivElement | null>(null)
  const formContainerElement = useRef<HTMLDivElement | null>(null)

  const requiredPermission = value._createdAt ? 'update' : 'create'

  const activeView = useMemo(
    () => views.find((view) => view.id === activeViewId) || views[0] || {type: 'form'},
    [activeViewId, views],
  )

  // Use a local portal container when split panes is supported
  const portalElement: HTMLElement | null = features.splitPanes
    ? _portalElement || parentPortal.element
    : parentPortal.element

  // Calculate the height of the header
  const margins: [number, number, number, number] = useMemo(() => {
    if (layoutCollapsed) {
      return [headerHeight || 0, 0, footerHeight ? footerHeight + 2 : 2, 0]
    }

    return [0, 0, 2, 0]
  }, [layoutCollapsed, footerHeight, headerHeight])

  const formViewHidden = activeView.type !== 'form'

  const activeViewNode = useMemo(() => {
    if (activeView.type === 'component' && activeView.component) {
      const ActiveViewComponent = activeView.component
      return (
        <ActiveViewComponent
          document={{
            draft: editState?.draft || null,
            displayed: displayed || value,
            historical: displayed,
            published: editState?.published || null,
          }}
          documentId={documentId}
          options={activeView.options}
          schemaType={schemaType}
        />
      )
    }
    return false
  }, [activeView, displayed, documentId, editState?.draft, editState?.published, schemaType, value])

  const isLiveEdit = isLiveEditEnabled(schemaType)

  // Scroll to top as `documentId` changes
  useEffect(() => {
    if (!documentScrollElement?.scrollTo) return
    documentScrollElement.scrollTo(0, 0)
  }, [documentId, documentScrollElement])

  // Pass portal element to `DocumentPane`
  useEffect(() => {
    if (portalElement) {
      setDocumentPanelPortalElement(portalElement)
    }
  }, [portalElement, setDocumentPanelPortalElement])

  const inspectDialog = useMemo(() => {
    return isInspectOpen ? <InspectDialog value={displayed || value} /> : null
  }, [isInspectOpen, displayed, value])

  const showInspector = Boolean(!collapsed && inspector)
  const {selectedPerspective, selectedReleaseId} = usePerspective()

  const banners = useMemo(() => {
    if (params?.historyVersion) {
      return <ArchivedReleaseDocumentBanner />
    }
    const isCreatingDocument = displayed && !displayed._createdAt
    const isScheduledRelease =
      isReleaseDocument(selectedPerspective) && isReleaseScheduledOrScheduling(selectedPerspective)

    if (isScheduledRelease) {
      return <ScheduledReleaseBanner currentRelease={selectedPerspective as ReleaseDocument} />
    }
    if (
      displayed?._id &&
      getVersionFromId(displayed._id) !== selectedReleaseId &&
      ready &&
      !isCreatingDocument
    ) {
      return (
        <AddToReleaseBanner
          documentId={value._id}
          currentRelease={selectedPerspective as ReleaseDocument}
          value={displayed || undefined}
        />
      )
    }

    if (
      activeView.type === 'form' &&
      isLiveEdit &&
      ready &&
      editState?.draft?._id &&
      !selectedReleaseId
    ) {
      return (
        <DraftLiveEditBanner
          displayed={displayed}
          documentId={documentId}
          schemaType={schemaType}
        />
      )
    }

    if (activeView.type !== 'form' || isPermissionsLoading || !ready) return null

    return (
      <>
        {!permissions?.granted && (
          <InsufficientPermissionBanner requiredPermission={requiredPermission} />
        )}
        <ReferenceChangedBanner />
        <DeprecatedDocumentTypeBanner />
        <DeletedDocumentBanners />
        <UnpublishedDocumentBanner />
      </>
    )
  }, [
    params?.historyVersion,
    displayed,
    selectedPerspective,
    selectedReleaseId,
    ready,
    activeView.type,
    isLiveEdit,
    editState?.draft?._id,
    isPermissionsLoading,
    permissions?.granted,
    requiredPermission,
    value._id,
    documentId,
    schemaType,
  ])

  return (
    <PaneContent>
      <Flex height="fill">
        {(features.resizablePanes || !showInspector) && (
          <DocumentBox flex={2} overflow="hidden">
            <PortalProvider
              element={portalElement}
              __unstable_elements={{documentScrollElement: documentScrollElement}}
            >
              <BoundaryElementProvider element={documentScrollElement}>
                <VirtualizerScrollInstanceProvider
                  scrollElement={documentScrollElement}
                  containerElement={formContainerElement}
                >
                  {banners}
                  <Scroller
                    $disabled={layoutCollapsed || false}
                    data-testid="document-panel-scroller"
                    ref={setDocumentScrollElement}
                  >
                    <FormView
                      hidden={formViewHidden}
                      margins={margins}
                      ref={formContainerElement}
                    />
                    {activeViewNode}
                  </Scroller>

                  {inspectDialog}

                  <div data-testid="document-panel-portal" ref={setPortalElement} />
                </VirtualizerScrollInstanceProvider>
              </BoundaryElementProvider>
            </PortalProvider>
          </DocumentBox>
        )}

        {showInspector && (
          <BoundaryElementProvider element={rootElement}>
            <DocumentInspectorPanel
              documentId={documentId}
              documentType={schemaType.name}
              flex={1}
            />
          </BoundaryElementProvider>
        )}
      </Flex>
    </PaneContent>
  )
}
DocumentPanel.displayName = 'DocumentPanel'
