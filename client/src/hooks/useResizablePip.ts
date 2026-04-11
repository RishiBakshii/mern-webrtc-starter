import { useCallback, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'

type Corner = 'se' | 'nw'

type UseResizablePipOptions = {
  /** width / height (e.g. 16 / 9) */
  aspectRatio: number
  minWidth: number
  maxWidth: number
  initialWidth: number
  /**
   * `se`: handle on bottom-right — drag down/right to grow (panel anchored top-left).
   * `nw`: handle on top-left — drag up/left to grow (panel anchored bottom-right).
   */
  corner: Corner
}

type ResizeStart = {
  pointerX: number
  pointerY: number
  startWidth: number
}

/**
 * Fixed aspect-ratio resize from one corner (pointer delta projected for diagonal feel).
 */
export function useResizablePip(options: UseResizablePipOptions) {
  const { aspectRatio, minWidth, maxWidth, initialWidth, corner } = options

  const [widthPx, setWidthPx] = useState(initialWidth)
  const resizeStartRef = useRef<ResizeStart | null>(null)

  const heightPx = widthPx / aspectRatio

  const handleResizePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      event.stopPropagation()
      event.preventDefault()

      resizeStartRef.current = {
        pointerX: event.clientX,
        pointerY: event.clientY,
        startWidth: widthPx,
      }

      const onMove = (ev: globalThis.PointerEvent) => {
        if (!resizeStartRef.current) return
        const { pointerX, pointerY, startWidth } = resizeStartRef.current
        const dx = ev.clientX - pointerX
        const dy = ev.clientY - pointerY

        let delta: number
        if (corner === 'se') {
          delta = (dx + dy) / 2
        } else {
          delta = (-dx - dy) / 2
        }

        const next = Math.min(maxWidth, Math.max(minWidth, startWidth + delta))
        setWidthPx(next)
      }

      const onUp = () => {
        resizeStartRef.current = null
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerup', onUp)
      }

      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerup', onUp)
    },
    [corner, maxWidth, minWidth, widthPx],
  )

  return { widthPx, heightPx, handleResizePointerDown }
}
