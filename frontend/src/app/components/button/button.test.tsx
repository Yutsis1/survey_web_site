import React from 'react'
import { Button } from './button'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, test, expect, vi, afterEach, beforeEach } from 'vitest'

describe('Button component', () => {
    beforeEach(() => {
        document.body.innerHTML = ''
        vi.clearAllMocks()
        vi.resetModules()
    })

    afterEach(() => {
        vi.resetAllMocks()
    })
    test('renders button with label', () => {
        render(<Button label="Click me" />)
        const buttonElement = screen.getByText(/Click me/i)
        expect(buttonElement).toBeInTheDocument()
    })

    test('applies className prop', () => {
        render(<Button label="Click me" className="custom-class" />)
        const buttonElement = screen.getByText(/Click me/i)
        expect(buttonElement).toHaveClass('custom-class')
    })

    test('applies test_id prop', () => {
        render(<Button label="Click me" test_id="button-1" />)
        const buttonElement = screen.getByTestId('button-1')
        expect(buttonElement).toBeInTheDocument()
    })

    test('respects disabled prop', () => {
        render(<Button label="Click me" disabled />)
        const buttonElement = screen.getByText(/Click me/i)
        expect(buttonElement).toBeDisabled()
    })

    test('calls onClick prop when clicked', () => {
        const handleClick = vi.fn()
        render(<Button label="Click me" onClick={handleClick} />)
        const buttonElement = screen.getByText(/Click me/i)
        fireEvent.click(buttonElement)
        expect(handleClick).toHaveBeenCalledTimes(1)
    })
})
