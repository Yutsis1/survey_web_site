import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { InfoLabel } from './infoLabel'

describe('InfoLabel Component', () => {
    it('renders the text correctly', () => {
        const { getByText } = render(
            <InfoLabel text="Test message" type="info" />
        )
        expect(getByText('Test message')).toBeInTheDocument()
    })

    it('applies the correct class for info type', () => {
        const { container } = render(<InfoLabel text="Info" type="info" />)
        expect(container.firstChild).toHaveClass('label-info')
    })

    it('applies the correct class for warning type', () => {
        const { container } = render(
            <InfoLabel text="Warning" type="warning" />
        )
        expect(container.firstChild).toHaveClass('label-warning')
    })

    it('applies the correct class for error type', () => {
        const { container } = render(<InfoLabel text="Error" type="error" />)
        expect(container.firstChild).toHaveClass('label-error')
    })

    it('defaults to info type when type is not provided', () => {
        const { container } = render(<InfoLabel text="Default" />)
        expect(container.firstChild).toHaveClass('label-info')
    })
})
