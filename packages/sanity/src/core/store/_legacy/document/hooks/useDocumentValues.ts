import {useMemo} from 'react'
import {type Observable, of} from 'rxjs'

import {type LoadableState, useLoadable} from '../../../../util/useLoadable'
import {useDocumentPreviewStore} from '../../datastores'

/** @internal */
export function useDocumentValues<T = Record<string, unknown>>(
  documentId: string,
  paths: string[],
): LoadableState<T | undefined> {
  const documentPreviewStore = useDocumentPreviewStore()

  const documentValues$ = useMemo(
    () =>
      documentId
        ? (documentPreviewStore.observePaths(
            {_type: 'reference', _ref: documentId},
            paths,
          ) as Observable<T>)
        : of(undefined),
    [documentId, documentPreviewStore, paths],
  )

  return useLoadable(documentValues$)
}
