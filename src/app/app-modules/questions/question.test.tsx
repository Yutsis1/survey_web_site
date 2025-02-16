
import { render, fireEvent } from '@testing-library/react';
import { Question } from './question';

describe('Question Component', () => {
    const mockOnOptionChange = jest.fn();
    const options = [
        { label: 'Option 1', value: '1', activeLabel: 'Active', inactiveLabel: 'Inactive' },
        { label: 'Option 2', value: '2', activeLabel: 'Active', inactiveLabel: 'Inactive' },
    ];

    it('renders question text', () => {
        const { getByText } = render(
            <Question
                questionText="Sample Question?"
                component="TextInput"
                options={options}
                onOptionChange={mockOnOptionChange}
            />
        );
        expect(getByText('Sample Question?')).toBeInTheDocument();
    });

    it('renders TextInput component', () => {
        const { getByLabelText } = render(
            <Question
                questionText="Sample Question?"
                component="TextInput"
                options={options}
                onOptionChange={mockOnOptionChange}
            />
        );
        options.forEach(option => {
            expect(getByLabelText(option.label)).toBeInTheDocument();
        });
    });

    it('calls onOptionChange when TextInput value changes', () => {
        const { getByLabelText } = render(
            <Question
                questionText="Sample Question?"
                component="TextInput"
                options={options}
                onOptionChange={mockOnOptionChange}
            />
        );
        const input = getByLabelText('Option 1');
        fireEvent.change(input, { target: { value: 'new value' } });
        expect(mockOnOptionChange).toHaveBeenCalledWith(0, 'new value');
    });

    it('renders Checkbox component', () => {
        const { getByLabelText } = render(
            <Question
                questionText="Sample Question?"
                component="Checkbox"
                options={options}
                onOptionChange={mockOnOptionChange}
            />
        );
        options.forEach(option => {
            expect(getByLabelText(option.label)).toBeInTheDocument();
        });
    });

    it('calls onOptionChange when Checkbox value changes', () => {
        const { getByLabelText } = render(
            <Question
                questionText="Sample Question?"
                component="Checkbox"
                options={options}
                onOptionChange={mockOnOptionChange}
            />
        );
        const checkbox = getByLabelText('Option 1');
        fireEvent.change(checkbox, { target: { value: 'new value' } });
        expect(mockOnOptionChange).toHaveBeenCalledWith(0, 'new value');
    });

    it('renders RadioBar component', () => {
        const { getByLabelText } = render(
            <Question
                questionText="Sample Question?"
                component="RadioBar"
                options={options}
                onOptionChange={mockOnOptionChange}
            />
        );
        options.forEach(option => {
            expect(getByLabelText(option.label)).toBeInTheDocument();
        });
    });

    it('calls onOptionChange when RadioBar value changes', () => {
        const { getByLabelText } = render(
            <Question
                questionText="Sample Question?"
                component="RadioBar"
                options={options}
                onOptionChange={mockOnOptionChange}
            />
        );
        const radio = getByLabelText('Option 1');
        fireEvent.change(radio, { target: { value: 'new value' } });
        expect(mockOnOptionChange).toHaveBeenCalledWith(0, 'new value');
    });
});