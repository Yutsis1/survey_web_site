import React from 'react'
import { render, fireEvent, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { DeleteDropzone } from './deleteDropzone'

// A small test harness that uses the real DeleteDropzone and local state
function TestHarness() {
  const [questions, setQuestions] = React.useState([{ id: 'q1', text: 'Question 1' }])
  const [isDragging, setIsDragging] = React.useState(false)
  const [draggingId, setDraggingId] = React.useState<string | null>(null)
  const [isOverTrash, setIsOverTrash] = React.useState(false)

  const startDrag = (id: string) => {
    setDraggingId(id)
    setIsDragging(true)
  }

  const endDrag = () => {
    setIsDragging(false)
    setDraggingId(null)
    setIsOverTrash(false)
  }

  const removeQuestions = (id: string) => setQuestions((prev) => prev.filter((p) => p.id !== id))

  return (
    <div>
      <div data-testid="questions">
        {questions.map((q) => (
          <div key={q.id} className="grid-item">
            <div
              className="drag-handle"
              data-testid={`handle-${q.id}`}
              // mousedown simulates starting a drag from the handle
              onMouseDown={() => startDrag(q.id)}
              onMouseUp={endDrag}
            >
              ⋮⋮
            </div>
            <div data-testid={`content-${q.id}`}>{q.text}</div>
          </div>
        ))}
      </div>

      <DeleteDropzone
        isDragging={isDragging}
        isOverTrash={isOverTrash}
        onDragOver={(e) => {
          e.preventDefault()
          e.dataTransfer!.dropEffect = 'move'
        }}
        onDragEnter={() => setIsOverTrash(true)}
        onDragLeave={() => setIsOverTrash(false)}
        onDrop={() => {
          if (draggingId) removeQuestions(draggingId)
          endDrag()
        }}
      />
    </div>
  )
}

describe('DeleteDropzone integration', () => {
  it('removes a question when dragging from the handle and dropping on the dropzone', () => {
    render(<TestHarness />)

    // confirm question exists
    expect(screen.getByTestId('content-q1')).toBeTruthy()

    // start drag from the handle
    const handle = screen.getByTestId('handle-q1')
    fireEvent.mouseDown(handle)

    // now the dropzone should be in dragging state; simulate drag enter
    const dropCard = screen.getByRole('button', { name: /delete area/i })
    fireEvent.dragEnter(dropCard)

    // simulate drop
    fireEvent.drop(dropCard)

    // question should be removed
    expect(screen.queryByTestId('content-q1')).toBeNull()
  })


})
