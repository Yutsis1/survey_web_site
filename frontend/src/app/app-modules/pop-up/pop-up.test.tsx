import { fireEvent, render } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { PopUp } from "./pop-up";

describe('PopUp Component', () => {
    const mockOnClose = vi.fn()
    const mockOnCancel = vi.fn()
    const mockOnApply = vi.fn()
    const mockOnValueChange = vi.fn()

    const defaultProps = {
        isOpen: true,
        onClose: mockOnClose,
        onCancel: mockOnCancel,
        onApply: mockOnApply,
        onValueChange: mockOnValueChange,
        popUpTitle: 'Test Popup',
        popUpDescription: 'Test Description'
    }

    beforeEach(() => {
        document.body.innerHTML = ''
        vi.clearAllMocks()
        vi.resetModules()
    })

    afterEach(() => {
        vi.resetAllMocks()
    })


    it('renders nothing when isOpen is false', () => {
        const { container } = render(
            <PopUp {...defaultProps} isOpen={false} />
        )
        expect(container).toBeEmptyDOMElement()
    })

    it('renders popup content when isOpen is true', () => {
        const { getByText } = render(<PopUp {...defaultProps} />)
        
        expect(getByText('Test Popup')).toBeInTheDocument()
        expect(getByText('Test Description')).toBeInTheDocument()
    })

    it('calls onClose when Escape key is pressed', () => {
        const spy = vi.spyOn(defaultProps, 'onClose').mockImplementation(() => {})
        render(<PopUp {...defaultProps} />)

        fireEvent.keyDown(document, { key: 'Escape' })
        expect(spy).toHaveBeenCalled() 
        
    })

    it('calls onCancel when Cancel button is clicked', () => {
        const { getByTestId } = render(<PopUp {...defaultProps} />)
        
        fireEvent.click(getByTestId('cancel-button'))
        expect(mockOnCancel).toHaveBeenCalledTimes(1)
    })

    it('calls onApply when Apply button is clicked', () => {
        const { getByTestId } = render(<PopUp {...defaultProps} />)
        
        fireEvent.click(getByTestId('apply-button'))
        expect(mockOnApply).toHaveBeenCalledTimes(1)
    })

    it('disables Apply button when applyDisabled is true', () => {
        const { getByTestId } = render(
            <PopUp {...defaultProps} applyDisabled />
        )

        expect(getByTestId('apply-button')).toBeDisabled()
    })
})
