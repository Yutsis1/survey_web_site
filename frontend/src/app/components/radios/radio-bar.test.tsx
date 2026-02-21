import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { RadioBar } from './radio-bar'
import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest'

describe('RadioBar Component', () => {
    beforeEach(() => {
        document.body.innerHTML = ''
        vi.clearAllMocks()
        vi.resetModules()
    })

    afterEach(() => {
        vi.resetAllMocks()
    })
    const buttons = [
        { label: 'Option 1', value: '1' },
        { label: 'Option 2', value: '2' },
        { label: 'Option 3', value: '3' },
    ]

    test('renders radio buttons correctly', () => {
        const { getByLabelText } = render(
            <RadioBar buttons={buttons} name="testRadio" />
        )
        buttons.forEach((button) => {
            expect(getByLabelText(button.label)).toBeInTheDocument()
        })
    })

    test('selects the correct radio button on change', () => {
        const { getByRole } = render(
            <RadioBar buttons={buttons} name="testRadio" />
        )
        const option1 = getByRole('radio', { name: 'Option 1' })
        const option2 = getByRole('radio', { name: 'Option 2' })

        fireEvent.click(option1)
        expect(option1).toHaveAttribute('aria-checked', 'true')
        expect(option2).toHaveAttribute('aria-checked', 'false')

        fireEvent.click(option2)
        expect(option1).toHaveAttribute('aria-checked', 'false')
        expect(option2).toHaveAttribute('aria-checked', 'true')
    })

    test('renders with test_id', () => {
        const { getByTestId } = render(
            <RadioBar buttons={buttons} name="testRadio" test_id="radio-bar" />
        )
        expect(getByTestId('radio-bar')).toBeInTheDocument()
    })
})
