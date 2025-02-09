import React from 'react';
import { render, screen } from '@testing-library/react';
import Question from './Question';

test('renders question component', () => {
    render(<Question text="What is your name?" />);
    const questionElement = screen.getByText(/What is your name\?/i);
    expect(questionElement).toBeInTheDocument();
});