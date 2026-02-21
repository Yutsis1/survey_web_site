import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, test, vi, type Mock } from 'vitest'

const push = vi.fn()
vi.mock('next/navigation', () => ({
    useRouter: () => ({ push }),
}))

import * as AuthContextModule from '../contexts/auth-context'
vi.mock('../contexts/auth-context', async () => {
    const actual = await vi.importActual<typeof AuthContextModule>(
        '../contexts/auth-context'
    )
    return {
        ...actual,
        useAuth: vi.fn(),
    }
})

const mockedUseAuth = AuthContextModule.useAuth as unknown as Mock

import AuthPage from './page'

describe('AuthPage component', () => {
    let mockLogin: Mock
    let mockRegister: Mock

    beforeEach(() => {
        document.body.innerHTML = ''
        vi.clearAllMocks()
        push.mockReset()
        mockLogin = vi.fn().mockResolvedValue(undefined)
        mockRegister = vi.fn().mockResolvedValue(undefined)

        mockedUseAuth.mockReturnValue({
            isAuthenticated: false,
            isLoading: false,
            login: mockLogin,
            register: mockRegister,
            logout: vi.fn(),
            checkAuth: vi.fn(),
        })
    })

    afterEach(() => {
        cleanup()
        vi.resetAllMocks()
    })

    const emailInput = () => screen.getByLabelText('Email') as HTMLInputElement
    const passwordInput = () =>
        screen.getByLabelText('Password') as HTMLInputElement
    const repeatPasswordInput = () =>
        screen.getByLabelText('Repeat Password') as HTMLInputElement
    const submitButton = () => screen.getByTestId('auth-submit')
    const toggleModeButton = () => screen.getByTestId('toggle-mode')

    test('renders in login mode by default', () => {
        render(<AuthPage />)

        expect(emailInput()).toBeInTheDocument()
        expect(passwordInput()).toBeInTheDocument()
        expect(screen.queryByLabelText('Repeat Password')).not.toBeInTheDocument()
        expect(toggleModeButton()).toHaveTextContent('Register')
    })

    test('switches to register mode when toggle is clicked', async () => {
        const user = userEvent.setup()
        render(<AuthPage />)

        await user.click(toggleModeButton())

        expect(repeatPasswordInput()).toBeInTheDocument()
        expect(toggleModeButton()).toHaveTextContent('Login')
    })

    test('switches back to login mode when toggle is clicked again', async () => {
        const user = userEvent.setup()
        render(<AuthPage />)

        await user.click(toggleModeButton())
        await user.click(toggleModeButton())

        expect(screen.queryByLabelText('Repeat Password')).not.toBeInTheDocument()
        expect(toggleModeButton()).toHaveTextContent('Register')
    })

    test('displays email validation error for invalid email', async () => {
        const user = userEvent.setup()
        render(<AuthPage />)

        await user.type(emailInput(), 'invalid-email')

        expect(screen.getByText('Invalid email address')).toBeInTheDocument()
    })

    test('hides email validation error for valid email', async () => {
        const user = userEvent.setup()
        render(<AuthPage />)

        await user.type(emailInput(), 'invalid-email')
        expect(screen.getByText('Invalid email address')).toBeInTheDocument()

        await user.clear(emailInput())
        await user.type(emailInput(), 'test@example.com')

        await waitFor(() => {
            expect(
                screen.queryByText('Invalid email address')
            ).not.toBeInTheDocument()
        })
    })

    test('shows password rule errors in register mode for invalid password', async () => {
        const user = userEvent.setup()
        render(<AuthPage />)

        await user.click(toggleModeButton())
        await user.type(passwordInput(), 'abc')

        const error = screen.getByTestId('info-error')
        expect(error).toHaveTextContent(
            'Password must be at least 8 characters long'
        )
        expect(error).toHaveTextContent(
            'Password must contain at least one uppercase letter'
        )
    })

    test('hides password rule errors when password becomes valid', async () => {
        const user = userEvent.setup()
        render(<AuthPage />)

        await user.click(toggleModeButton())
        await user.type(passwordInput(), 'abc')
        expect(screen.getByTestId('info-error')).toBeInTheDocument()

        await user.clear(passwordInput())
        await user.type(passwordInput(), 'Password123!')

        await waitFor(() => {
            expect(screen.queryByTestId('info-error')).not.toBeInTheDocument()
        })
    })

    test('displays password mismatch error in register mode', async () => {
        const user = userEvent.setup()
        render(<AuthPage />)

        await user.click(toggleModeButton())
        await user.type(emailInput(), 'test@example.com')
        await user.type(passwordInput(), 'Password123!')
        await user.type(repeatPasswordInput(), 'Password123@')
        await user.click(submitButton())

        await waitFor(() => {
            expect(screen.getByTestId('info-error')).toHaveTextContent(
                'Passwords do not match'
            )
        })
    })

    test('calls login on submit in login mode and navigates', async () => {
        const user = userEvent.setup()
        render(<AuthPage />)

        await user.type(emailInput(), 'test@example.com')
        await user.type(passwordInput(), 'password123')
        await user.click(submitButton())

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith(
                'test@example.com',
                'password123'
            )
            expect(push).toHaveBeenCalledWith('/dashboard')
        })
    })

    test('calls register on submit in register mode and navigates', async () => {
        const user = userEvent.setup()
        render(<AuthPage />)

        await user.click(toggleModeButton())
        await user.type(emailInput(), 'test@example.com')
        await user.type(passwordInput(), 'Password123!')
        await user.type(repeatPasswordInput(), 'Password123!')
        await user.click(submitButton())

        await waitFor(() => {
            expect(mockRegister).toHaveBeenCalledWith(
                'test@example.com',
                'Password123!'
            )
            expect(push).toHaveBeenCalledWith('/dashboard')
        })
    })

    test('displays error on login failure', async () => {
        const user = userEvent.setup()
        mockLogin.mockRejectedValueOnce(new Error('Auth failed'))
        render(<AuthPage />)

        await user.type(emailInput(), 'test@example.com')
        await user.type(passwordInput(), 'password123')
        await user.click(submitButton())

        await waitFor(() => {
            expect(screen.getByTestId('info-error')).toHaveTextContent(
                'Authentication failed'
            )
        })
    })

    test('displays error on register failure', async () => {
        const user = userEvent.setup()
        mockRegister.mockRejectedValueOnce(new Error('Auth failed'))
        render(<AuthPage />)

        await user.click(toggleModeButton())
        await user.type(emailInput(), 'test@example.com')
        await user.type(passwordInput(), 'Password123!')
        await user.type(repeatPasswordInput(), 'Password123!')
        await user.click(submitButton())

        await waitFor(() => {
            expect(screen.getByTestId('info-error')).toHaveTextContent(
                'Authentication failed'
            )
        })
    })

    test('redirects and renders nothing when already authenticated', async () => {
        mockedUseAuth.mockReturnValue({
            isAuthenticated: true,
            isLoading: false,
            login: mockLogin,
            register: mockRegister,
            logout: vi.fn(),
            checkAuth: vi.fn(),
        })

        const { container } = render(<AuthPage />)

        await waitFor(() => {
            expect(push).toHaveBeenCalledWith('/dashboard')
        })
        expect(container).toBeEmptyDOMElement()
    })

    test('shows loading state while auth check is in progress', () => {
        mockedUseAuth.mockReturnValue({
            isAuthenticated: false,
            isLoading: true,
            login: mockLogin,
            register: mockRegister,
            logout: vi.fn(),
            checkAuth: vi.fn(),
        })

        render(<AuthPage />)

        expect(screen.getByText('Loading...')).toBeInTheDocument()
    })
})
