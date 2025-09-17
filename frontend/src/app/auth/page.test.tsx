import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, test, expect, vi, afterEach, beforeEach } from 'vitest'

// Mock the auth services before importing the component under test
vi.mock('../services/auth', () => ({
    login: vi.fn(),
    register: vi.fn(),
}))

// Mock DynamicComponentRenderer before importing the component under test
vi.mock('../../components/dynamic-component-renderer', () => ({
    DynamicComponentRenderer: ({ component, option }: any) => {
        if (component === 'TextInput') {
            const { label, value, onChange, type, placeholder } =
                option.optionProps
            return (
                <div>
                    <label>{label}</label>
                    <input
                        type={type}
                        placeholder={placeholder}
                        value={value || ''}
                        onChange={onChange}
                        data-testid={`input-${label.toLowerCase().replace(' ', '-')}`}
                    />
                </div>
            )
        }
        if (component === 'InfoLabel') {
            const { text, type } = option.optionProps
            return <div data-testid={`info-${type}`}>{text}</div>
        }
        if (component === 'Button') {
            const { onClick, label, test_id } = option.optionProps
            return (
                <button onClick={onClick} data-testid={test_id}>
                    {label}
                </button>
            )
        }
        return null
    },
}))

import AuthPage from './page'
import { login, register } from '../services/auth'
import { get } from 'http'
import { fi } from 'zod/v4/locales'

class AuthPageTestSuite {
    static run() {
        // Mock the auth services
        vi.mock('../services/auth', () => ({
            login: vi.fn(),
            register: vi.fn(),
        }))

        // Mock DynamicComponentRenderer
        vi.mock('../../components/dynamic-component-renderer', () => ({
            DynamicComponentRenderer: ({ component, option }: any) => {
                if (component === 'TextInput') {
                    const { label, value, onChange, type, placeholder } =
                        option.optionProps
                    return (
                        <div>
                            <label>{label}</label>
                            <input
                                type={type}
                                placeholder={placeholder}
                                value={value || ''}
                                onChange={onChange}
                                data-testid={`input-${label.toLowerCase().replace(' ', '-')}`}
                            />
                        </div>
                    )
                }
                if (component === 'InfoLabel') {
                    const { text, type } = option.optionProps
                    return <div data-testid={`info-${type}`}>{text}</div>
                }
                if (component === 'Button') {
                    const { onClick, label, test_id } = option.optionProps
                    return (
                        <button onClick={onClick} data-testid={test_id}>
                            {label}
                        </button>
                    )
                }
                return null
            },
        }))

        // Alternative 3: Page object as functions
        // locate the actual input elements inside the wrapper returned by the real component
        const getEmailInput = () =>
            screen
                .getByTestId('input-email')
                .querySelector('input') as HTMLInputElement
        const getPasswordInput = () =>
            screen
                .getByTestId('input-password')
                .querySelector('input') as HTMLInputElement
        const getRepeatInput = () =>
            screen
                .getByTestId('input-repeat-password')
                .querySelector('input') as HTMLInputElement
        const getSubmitButton = () => screen.getByTestId('auth-submit')
        const fillEmail = async (value: string) =>
            await userEvent.type(getEmailInput(), value)
        const fillPassword = async (value: string) =>
            await userEvent.type(getPasswordInput(), value)
        const fillRepeat = async (value: string) =>
            await userEvent.type(getRepeatInput(), value)
        const submit = () => fireEvent.click(getSubmitButton())
        const modeButton = () => screen.getByTestId('toggle-mode')
        const toggleMode = () => fireEvent.click(modeButton())

        const registerText = "Don't have an account?"
        const loginText = 'Already have an account?'

        const emailError = 'Invalid email address'
        const passwordMismatchError = 'Passwords do not match'
        const authFailedError = 'Authentication failed'

        const placeholderMessages = {
            email: 'Enter your email',
            password: 'Enter your password',
            repeat: 'Repeat Password',
        }

        describe('AuthPage component', () => {
            beforeEach(() => {
                document.body.innerHTML = ''
                vi.clearAllMocks()
                vi.resetModules()
            })

            afterEach(() => {
                vi.resetAllMocks()
            })

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
                expect(
                    screen.getByText(placeholderMessages.repeat)
                ).toBeInTheDocument()
            })

            test('switches back to login mode when link is clicked in register mode', () => {
                render(<AuthPage />)
                toggleMode()
                expect(modeButton()).toHaveTextContent('Login')
                expect(screen.getByText(loginText)).toBeInTheDocument()
                expect(
                    screen.getByText(placeholderMessages.repeat)
                ).toBeInTheDocument()
                toggleMode()
                expect(modeButton()).toHaveTextContent('Register')
                expect(
                    screen.queryByText(placeholderMessages.repeat)
                ).not.toBeInTheDocument()
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
                    expect(
                        screen.queryByTestId('info-error')
                    ).not.toBeInTheDocument()
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

            test('calls login on submit in login mode with success', async () => {
                const mockLogin = vi.mocked(login)
                mockLogin.mockResolvedValueOnce(undefined)
                const alertSpy = vi
                    .spyOn(window, 'alert')
                    .mockImplementation(() => {})
                render(<AuthPage />)
                await fillEmail('test@example.com')
                await fillPassword('password123')
                submit()
                await waitFor(() => {
                    expect(mockLogin).toHaveBeenCalledWith({
                        email: 'test@example.com',
                        password: 'password123',
                    })
                    expect(alertSpy).toHaveBeenCalledWith('Success')
                })
                alertSpy.mockRestore()
            })

            test('calls register on submit in register mode with success', async () => {
              const mockRegister = vi.mocked(register)
              mockRegister.mockResolvedValueOnce(undefined)
              const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
              render(<AuthPage />)
                toggleMode()
                await fillEmail('test@example.com')
                await fillPassword('password123')
                await fillRepeat('password123')
                submit()
              await waitFor(() => {
                expect(mockRegister).toHaveBeenCalledWith({ email: 'test@example.com', password: 'password123' })
                expect(alertSpy).toHaveBeenCalledWith('Success')
              })
              alertSpy.mockRestore()
            })

            test('displays error on login failure', async () => {
              const mockLogin = vi.mocked(login)
              mockLogin.mockRejectedValueOnce(new Error('Auth failed'))
              render(<AuthPage />)
                await fillEmail('test@example.com')
                await fillPassword('password123')
                submit()
              await waitFor(() => {
                expect(screen.getByTestId('info-error')).toHaveTextContent('Authentication failed')
              })
            })

            test('displays error on register failure', async () => {
              const mockRegister = vi.mocked(register)
              mockRegister.mockRejectedValueOnce(new Error('Auth failed'))
              render(<AuthPage />)
                toggleMode()
                await fillEmail('test@example.com')
                await fillPassword('password123')
                await fillRepeat('password123')
                submit()
              await waitFor(() => {
                expect(screen.getByTestId('info-error')).toHaveTextContent('Authentication failed')
              })
            })
        })
    }
}

AuthPageTestSuite.run()
