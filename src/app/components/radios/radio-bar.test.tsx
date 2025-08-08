import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { RadioBar } from './radio-bar';
import { describe, test, expect } from 'vitest';

describe('RadioBar Component', () => {
    const buttons = [
        { label: 'Option 1', value: '1' },
        { label: 'Option 2', value: '2' },
        { label: 'Option 3', value: '3' },
    ];

    test('renders radio buttons correctly', () => {
        const { getByLabelText } = render(<RadioBar buttons={buttons} name="testRadio" />);
        buttons.forEach(button => {
            expect(getByLabelText(button.label)).toBeInTheDocument();
        });
    });

    test('selects the correct radio button on change', () => {
        const { getByLabelText } = render(<RadioBar buttons={buttons} name="testRadio" />);
        const option1 = getByLabelText('Option 1') as HTMLInputElement;
        const option2 = getByLabelText('Option 2') as HTMLInputElement;

        fireEvent.click(option1);
        expect(option1.checked).toBe(true);
        expect(option2.checked).toBe(false);

        fireEvent.click(option2);
        expect(option1.checked).toBe(false);
        expect(option2.checked).toBe(true);
    });

    test('renders with test_id', () => {
        const { getByTestId } = render(<RadioBar buttons={buttons} name="testRadio" test_id="radio-bar" />);
        expect(getByTestId('radio-bar')).toBeInTheDocument();
    });
});