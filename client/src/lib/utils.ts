import type React from 'react'

export const readMessage = (error: unknown): string => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as { response?: unknown }).response === 'object' &&
    (error as { response?: unknown }).response !== null &&
    'data' in (error as { response: { data?: unknown } }).response &&
    typeof (error as { response: { data?: unknown } }).response.data === 'object' &&
    (error as { response: { data?: unknown } }).response.data !== null &&
    'message' in (error as { response: { data: { message?: unknown } } }).response.data &&
    typeof (error as { response: { data: { message?: unknown } } }).response.data.message ===
      'string'
  ) {
    return (error as { response: { data: { message: string } } }).response.data.message
  }

  return error instanceof Error ? error.message : 'Request failed'
}

type DragOffset = { x: number; y: number }
type DragStart = { pointerX: number; pointerY: number; startX: number; startY: number }

export const handleDraggablePointerDown = (
  event: React.PointerEvent<HTMLDivElement>,
  currentOffset: DragOffset,
  dragStartRef: React.MutableRefObject<DragStart | null>,
  setOffset: React.Dispatch<React.SetStateAction<DragOffset>>,
) => {
  dragStartRef.current = {
    pointerX: event.clientX,
    pointerY: event.clientY,
    startX: currentOffset.x,
    startY: currentOffset.y,
  }

  const handlePointerMove = (moveEvent: globalThis.PointerEvent) => {
    if (!dragStartRef.current) return
    const deltaX = moveEvent.clientX - dragStartRef.current.pointerX
    const deltaY = moveEvent.clientY - dragStartRef.current.pointerY

    setOffset({
      x: dragStartRef.current.startX + deltaX,
      y: dragStartRef.current.startY + deltaY,
    })
  }

  const handlePointerUp = () => {
    dragStartRef.current = null
    window.removeEventListener('pointermove', handlePointerMove)
    window.removeEventListener('pointerup', handlePointerUp)
  }

  window.addEventListener('pointermove', handlePointerMove)
  window.addEventListener('pointerup', handlePointerUp)
}
