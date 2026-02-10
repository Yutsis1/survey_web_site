// page.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, test, expect, vi, afterEach, beforeEach, Mock } from 'vitest'

// supper clear that vitest not sutable for component tests. Better have server mock library and render page in browser

// ---- Mock DynamicComponentRenderer (simple stub inputs/buttons/labels)
vi.mock('../components/dynamic-component-renderer', () => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    DynamicComponentRenderer: ({ component, option }: any) => {
        if (component === 'TextInput') {
            const { label, value, onChange, type, placeholder, test_id } =
                option.optionProps
            return (
                <div>
                    <label>{label}</label>
                    <input
                        type={type}
                        placeholder={placeholder}
                        value={value ?? ''}
                        onChange={onChange}
                        data-testid={
                            test_id ??
                            `input-${label.toLowerCase().replace(' ', '-')}`
                        }
                        //  data-testid={`input-${label.toLowerCase().replace(' ', '-')}`}
                    />
                </div>
            )
        }
        if (component === 'InfoLabel') {
            const { text, type, test_id } = option.optionProps
            return <div data-testid={test_id ?? `info-${type}`}>{text}</div>
        }
        if (component === 'Button') {
            const { onClick, label, test_id, disabled } = option.optionProps
            return (
                <button
                    onClick={onClick}
                    data-testid={test_id}
                    disabled={disabled}
                >
                    {label}
                </button>
            )
        }
        return null
    },
}))

// ---- Mock the router (page pushes on success)
const push = vi.fn()
vi.mock('next/navigation', () => ({
    useRouter: () => ({ push }),
}))

// ---- Mock useAuth (the component uses the hook, not the raw functions)
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

// ----- Page object helpers (inputs are the elements with these testids)
const getEmailInput = () =>
    screen.getByTestId('input-email') as HTMLInputElement
const getPasswordInput = () =>
    screen.getByTestId('input-password') as HTMLInputElement
const getRepeatInput = () =>
    screen.getByTestId('input-repeat-password') as HTMLInputElement
const getSubmitButton = () => screen.getByTestId('auth-submit')
const fillEmail = async (v: string) => userEvent.type(getEmailInput(), v)
const fillPassword = async (v: string) => userEvent.type(getPasswordInput(), v)
const fillRepeat = async (v: string) => userEvent.type(getRepeatInput(), v)
const submit = () => fireEvent.click(getSubmitButton())
const modeButton = () => screen.getByTestId('toggle-mode')
const toggleMode = () => fireEvent.click(modeButton())

describe('AuthPage component', () => {
    let mockLogin: Mock
    let mockRegister: Mock

    beforeEach(() => {
        document.body.innerHTML = ''
        vi.clearAllMocks()
        push.mockReset()
        mockLogin = vi.fn().mockResolvedValue(undefined)
        mockRegister = vi.fn().mockResolvedValue(undefined)

        // default auth state for tests (not authed, not loading)
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
        vi.resetAllMocks()
    })

    const registerText = "Don't have an account?"
    const loginText = 'Already have an account?'

    test('renders in login mode by default', () => {
        render(<AuthPage />)
        expect(getEmailInput()).toBeInTheDocument()
        expect(getPasswordInput()).toBeInTheDocument()
        expect(modeButton()).toBeInTheDocument()
        expect(screen.getByText(registerText)).toBeInTheDocument()
        expect(screen.queryByText(loginText)).not.toBeInTheDocument()
    })

    test('switches to register mode when Register is clicked', () => {
        render(<AuthPage />)
        toggleMode()
        expect(modeButton()).toHaveTextContent('Login')
        expect(screen.getByText(loginText)).toBeInTheDocument()
        // The label is "Repeat Password" in the component
        expect(screen.getByText('Repeat Password')).toBeInTheDocument()
    })

    test('switches back to login mode when link is clicked in register mode', () => {
        render(<AuthPage />)
        toggleMode()
        expect(modeButton()).toHaveTextContent('Login')
        expect(screen.getByText(loginText)).toBeInTheDocument()
        expect(screen.getByText('Repeat Password')).toBeInTheDocument()
        toggleMode()
        expect(modeButton()).toHaveTextContent('Register')
        expect(screen.queryByText('Repeat Password')).not.toBeInTheDocument()
    })

    test('displays email validation error for invalid email', async () => {
        render(<AuthPage />)
        await fillEmail('invalid-email')
        await waitFor(() => {
            expect(screen.getByTestId('info-error')).toHaveTextContent(
                'Invalid email address'
            )
        })
    })

    test('does not display email validation error for valid email', async () => {
        render(<AuthPage />)
        await fillEmail('test@example.com')
        await waitFor(() => {
            expect(screen.queryByTestId('info-error')).not.toBeInTheDocument()
        })
    })

    test('displays password mismatch error in register mode', async () => {
        render(<AuthPage />)
        toggleMode()
        await fillPassword('password123')
        await fillRepeat('password124')
        submit()
        await waitFor(() => {
            expect(screen.getByTestId('info-error')).toHaveTextContent(
                'Passwords do not match'
            )
        })
    })

    test('calls login on submit in login mode with success and navigates', async () => {
        render(<AuthPage />)
        await fillEmail('test@example.com')
        await fillPassword('password123')
        submit()
        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith(
                'test@example.com',
                'password123'
            )
            expect(push).toHaveBeenCalledWith('/survey-builder')
        })
    })

    test('calls register on submit in register mode with success and navigates', async () => {
        render(<AuthPage />)
        toggleMode()
        await fillEmail('test@example.com')
        await fillPassword('password123')
        await fillRepeat('password123')
        submit()
        await waitFor(() => {
            expect(mockRegister).toHaveBeenCalledWith(
                'test@example.com',
                'password123'
            )
            expect(push).toHaveBeenCalledWith('/survey-builder')
        })
    })

    test('displays error on login failure', async () => {
        mockLogin.mockRejectedValueOnce(new Error('Auth failed'))
        render(<AuthPage />)
        await fillEmail('test@example.com')
        await fillPassword('password123')
        submit()
        await waitFor(() => {
            expect(screen.getByTestId('info-error')).toHaveTextContent(
                'Authentication failed'
            )
        })
    })

    test('displays error on register failure', async () => {
        mockRegister.mockRejectedValueOnce(new Error('Auth failed'))
        render(<AuthPage />)
        toggleMode()
        await fillEmail('test@example.com')
        await fillPassword('password123')
        await fillRepeat('password123')
        submit()
        await waitFor(() => {
            expect(screen.getByTestId('info-error')).toHaveTextContent(
                'Authentication failed'
            )
        })
    })
})
