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

    it('renders children content inside the popup', () => {
        const { getByText } = render(
            <PopUp {...defaultProps}>
                <div>Custom Content</div>
                <div>Another Element</div>
            </PopUp>
        )

        expect(getByText('Custom Content')).toBeInTheDocument()
        expect(getByText('Another Element')).toBeInTheDocument()
    })

    it('renders without description when not provided', () => {
        const { queryByText, getByText } = render(
            <PopUp
                {...defaultProps}
                popUpDescription={undefined}
            />
        )

        expect(getByText('Test Popup')).toBeInTheDocument()
        expect(queryByText('Test Description')).not.toBeInTheDocument()
    })

    it('uses onClose when onCancel is not provided', () => {
        const { getByTestId } = render(
            <PopUp
                isOpen={true}
                onClose={mockOnClose}
                onApply={mockOnApply}
                popUpTitle="Test"
            />
        )

        fireEvent.click(getByTestId('cancel-button'))
        expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('applies correct CSS classes to dialog content', () => {
        const { container } = render(<PopUp {...defaultProps} />)

        const dialogContent = container.querySelector('.popup-content')
        expect(dialogContent).toBeInTheDocument()
        expect(dialogContent).toHaveClass('border-border')
        expect(dialogContent).toHaveClass('bg-card')
    })

    it('applies scrollable container class to children wrapper', () => {
        const { container } = render(
            <PopUp {...defaultProps}>
                <div>Content</div>
            </PopUp>
        )

        const contentContainer = container.querySelector('.popup-container')
        expect(contentContainer).toBeInTheDocument()
        expect(contentContainer).toHaveClass('max-h-[55vh]')
        expect(contentContainer).toHaveClass('overflow-auto')
    })
})
