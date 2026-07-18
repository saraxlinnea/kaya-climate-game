import { useEffect } from 'react'

/** Set document title for the current view. */
export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = title
  }, [title])
}
