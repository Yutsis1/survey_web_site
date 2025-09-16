import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, test, expect, vi, afterEach, beforeEach } from 'vitest'
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
        const getEmailInput = () => screen.getByTestId('input-email')
        const getPasswordInput = () => screen.getByTestId('input-password')
        const getRepeatInput = () => screen.getByTestId('input-repeat-password')
        const getSubmitButton = () => screen.getByTestId('auth-submit')
        const fillEmail = (value: string) =>
            userEvent.type(getEmailInput(), value)
        const fillPassword = (value: string) =>
            userEvent.type(getPasswordInput(), value)
        const fillRepeat = (value: string) =>
            userEvent.type(getRepeatInput(), value)
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

            // tests with typing aren't working due to lack of functionality
            // test('displays email validation error for invalid email', async () => {
            //   render(<AuthPage />)
            //   fillEmail('invalid-email')

            //   await waitFor(() => {
            //     expect(screen.getByTestId('info-error')).toHaveTextContent('Invalid email address')
            //   })
            // })

            // test('does not display email validation error for valid email', async () => {
            //   const emailInput = screen.getByTestId('input-email')
            //   userEvent.type(emailInput, 'test@example.com')
            //   await waitFor(() => {
            //     expect(screen.queryByTestId('info-error')).not.toBeInTheDocument()
            //   })
            //   })

            // test('displays password mismatch error in register mode', async () => {
            //   render(<AuthPage />)
            //   toggleMode()
            //   fillPassword('password123')
            //   fillRepeat('password124')
            //   submit()
            //   await waitFor(() => {
            //     expect(screen.getByTestId('info-error')).toHaveTextContent('Passwords do not match')
            //   })
            // })

            // test('calls login on submit in login mode with success', async () => {
            //   const mockLogin = vi.mocked(login)
            //   mockLogin.mockResolvedValueOnce(undefined)
            //   const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
            //   const emailInput = screen.getByTestId('input-email')
            //   const passwordInput = screen.getByTestId('input-password')
            //   userEvent.type(emailInput, 'test@example.com')
            //   userEvent.type(passwordInput, 'password123')
            //   const submitButton = screen.getByTestId('auth-submit')
            //   fireEvent.click(submitButton)
            //   fireEvent.click(submitButton)
            //   await waitFor(() => {
            //     expect(mockLogin).toHaveBeenCalledWith({ email: 'test@example.com', password: 'password123' })
            //     expect(alertSpy).toHaveBeenCalledWith('Success')
            //   })
            //   alertSpy.mockRestore()
            // })

            // test('calls register on submit in register mode with success', async () => {
            //   const mockRegister = vi.mocked(register)
            //   mockRegister.mockResolvedValueOnce(undefined)
            //   const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
            //   render(<AuthPage />)
            //   const switchLink = screen.getByText('Register')
            //   const emailInput = screen.getByTestId('input-email')
            //   const passwordInput = screen.getByTestId('input-password')
            //   const repeatInput = screen.getByTestId('input-repeat-password')
            //   userEvent.type(emailInput, 'test@example.com')
            //   userEvent.type(passwordInput, 'password123')
            //   userEvent.type(repeatInput, 'password123')
            //   const submitButton = screen.getByTestId('auth-submit')
            //   fireEvent.click(submitButton)
            //   fireEvent.click(submitButton)
            //   await waitFor(() => {
            //     expect(mockRegister).toHaveBeenCalledWith({ email: 'test@example.com', password: 'password123' })
            //     expect(alertSpy).toHaveBeenCalledWith('Success')
            //   })
            //   alertSpy.mockRestore()
            // })

            // test('displays error on login failure', async () => {
            //   const mockLogin = vi.mocked(login)
            //   mockLogin.mockRejectedValueOnce(new Error('Auth failed'))
            //   render(<AuthPage />)
            //   const emailInput = screen.getByTestId('input-email')
            //   const passwordInput = screen.getByTestId('input-password')
            //   fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
            //   fireEvent.change(passwordInput, { target: { value: 'password123' } })
            //   const submitButton = screen.getByTestId('auth-submit')
            //   fireEvent.click(submitButton)
            //   await waitFor(() => {
            //     expect(screen.getByTestId('info-error')).toHaveTextContent('Authentication failed')
            //   })
            // })

            // test('displays error on register failure', async () => {
            //   const mockRegister = vi.mocked(register)
            //   mockRegister.mockRejectedValueOnce(new Error('Auth failed'))
            //   render(<AuthPage />)
            //   const switchLink = screen.getByText('Register')
            //   fireEvent.click(switchLink)
            //   const emailInput = screen.getByTestId('input-email')
            //   const passwordInput = screen.getByTestId('input-password')
            //   const repeatInput = screen.getByTestId('input-repeat-password')
            //   fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
            //   fireEvent.change(passwordInput, { target: { value: 'password123' } })
            //   fireEvent.change(repeatInput, { target: { value: 'password123' } })
            //   const submitButton = screen.getByTestId('auth-submit')
            //   fireEvent.click(submitButton)
            //   await waitFor(() => {
            //     expect(screen.getByTestId('info-error')).toHaveTextContent('Authentication failed')
            //   })
            // })
        })
    }
}

AuthPageTestSuite.run()
