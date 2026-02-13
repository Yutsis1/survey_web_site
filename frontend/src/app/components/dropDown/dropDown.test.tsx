import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DropDown } from './dropDown'

describe('DropDown component', () => {
    beforeEach(() => {
        document.body.innerHTML = ''
        vi.clearAllMocks()
        vi.resetModules()
    })

    afterEach(() => {
        vi.resetAllMocks()
    })

    const options = [
        { value: 'survey-1', label: 'Survey One (abc12345)' },
        { value: 'survey-2', label: 'Survey Two (def67890)' },
    ]

    it('renders labeled options', () => {
        render(
            <DropDown
                options={options}
                selectedOption="survey-1"
                onSelect={() => {}}
            />
        )

        expect(
            screen.getByRole('option', { name: 'Survey One (abc12345)' })
        ).toHaveValue('survey-1')
        expect(
            screen.getByRole('option', { name: 'Survey Two (def67890)' })
        ).toHaveValue('survey-2')
    })

    it('calls onSelect with selected value', () => {
        const onSelect = vi.fn()
        render(
            <DropDown
                options={options}
                selectedOption="survey-1"
                onSelect={onSelect}
            />
        )

        fireEvent.change(screen.getByRole('combobox'), {
            target: { value: 'survey-2' },
        })

        expect(onSelect).toHaveBeenCalledWith('survey-2')
    })

    it('respects disabled prop', () => {
        render(
            <DropDown
                options={options}
                selectedOption="survey-1"
                onSelect={() => {}}
                disabled
            />
        )

        expect(screen.getByRole('combobox')).toBeDisabled()
    })
})
