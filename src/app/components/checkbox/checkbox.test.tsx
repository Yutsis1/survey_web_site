import React from 'react';
import { render, screen } from '@testing-library/react';
import Checkbox from './Checkbox';

test('renders Checkbox component', () => {
    render(<Checkbox />);
    const checkboxElement = screen.getByRole('checkbox');
    expect(checkboxElement).toBeInTheDocument();
});