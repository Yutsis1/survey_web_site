import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { CheckboxTiles } from './checkbox-tiles'

describe('CheckboxTiles Component', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    vi.clearAllMocks()
  })

  const buttons = [
    { label: 'Option 1', value: '1' },
    { label: 'Option 2', value: '2' },
    { label: 'Option 3', value: '3' },
  ]

  test('renders checkbox tiles correctly', () => {
    const { getByLabelText } = render(
      <CheckboxTiles buttons={buttons} name="testCheckboxTiles" />
    )
    buttons.forEach((button) => {
      expect(getByLabelText(button.label)).toBeInTheDocument()
    })
  })

  test('supports selecting multiple values', () => {
    const onChange = vi.fn()
    const { getByRole } = render(
      <CheckboxTiles buttons={buttons} name="testCheckboxTiles" onChange={onChange} />
    )

    fireEvent.click(getByRole('checkbox', { name: 'Option 1' }))
    fireEvent.click(getByRole('checkbox', { name: 'Option 2' }))

    expect(onChange).toHaveBeenNthCalledWith(1, ['1'])
    expect(onChange).toHaveBeenNthCalledWith(2, ['1', '2'])
  })
})
