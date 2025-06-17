import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { PopUp } from './pop-up';
import { Button } from '../../components/button/button';

jest.mock('../../components/button/button', () => ({
    Button: jest.fn(({ label, onClick, test_id }) => (
        <button data-testid={test_id} onClick={onClick}>
            {label}
        </button>
    )),
}));

describe('PopUp Component', () => {
    const mockOnClose = jest.fn();
    const mockOnApply = jest.fn();
    const defaultProps = {
        isOpen: true,
        onClose: mockOnClose,
        onApply: mockOnApply,
        popUpTitle: 'Test Title',
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders nothing when isOpen is false', () => {
        const { container } = render(
            <PopUp {...defaultProps} isOpen={false} />
        );
        expect(container.firstChild).toBeNull();
    });

    it('renders popup content when isOpen is true', () => {
        const { getByText } = render(<PopUp {...defaultProps} />);
        expect(getByText('Test Title')).toBeInTheDocument();
    });

    it('renders description when provided', () => {
        const { getByText } = render(
            <PopUp {...defaultProps} popUpDescription="Test Description" />
        );
        expect(getByText('Test Description')).toBeInTheDocument();
    });

    it('calls onClose when Cancel button is clicked', () => {
        const { getByTestId } = render(<PopUp {...defaultProps} />);
        fireEvent.click(getByTestId('cancel-button'));
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('calls onApply when Apply button is clicked', () => {
        const { getByTestId } = render(<PopUp {...defaultProps} />);
        fireEvent.click(getByTestId('apply-button'));
        expect(mockOnApply).toHaveBeenCalledTimes(1);
    });

    it('renders components and options when provided', () => {
        const testComponents = ['button' as const];
        const testOptions = [
            { optionProps: { label: 'Test Button' } }
        ];
        const { container } = render(
            <PopUp
                {...defaultProps}
                components={testComponents}
                options={testOptions}
            />
        );
        expect(container.querySelector('.popup-container')).toBeInTheDocument();
    });

    it('has correct button styling classes', () => {
        const { getByTestId } = render(<PopUp {...defaultProps} />);
        const cancelButton = getByTestId('cancel-button').parentElement;
        expect(cancelButton).toHaveClass('button-secondary');
    });
});