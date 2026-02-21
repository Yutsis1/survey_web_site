import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { Question, QuestionProps } from './question'

describe('Question Component', () => {
    beforeEach(() => {
        document.body.innerHTML = ''
        vi.clearAllMocks()
        vi.resetModules()
    })

    afterEach(() => {
        vi.resetAllMocks()
    })
    describe('Checkbox', () => {
        const props: QuestionProps<'Checkbox'> = {
            questionText: 'KEK',
            component: 'Checkbox',
            option: {
                optionProps: {
                    activeLabel: 'ON',
                    inactiveLabel: 'OFF',
                    checked: false,
                    onChange: function (checked: boolean): void {
                        props.option.optionProps.checked = checked
                    },
                },
            },
            showQuestionText: true,
        }

        it('renders the question text', () => {
            const { getByText } = render(<Question {...props} />)
            expect(getByText(props.questionText)).toBeInTheDocument()
        })

        it('renders the checkbox component', () => {
            const component = render(<Question {...props} />)
            expect(component.getByRole('switch', { name: 'OFF' })).toHaveAttribute(
                'aria-checked',
                'false'
            )
            fireEvent.click(component.getByRole('switch', { name: 'OFF' }))
            expect(component.getByText('ON')).toBeInTheDocument()
            expect(component.getByRole('switch', { name: 'ON' })).toHaveAttribute(
                'aria-checked',
                'true'
            )
        })
    })
    describe('RadioBar', () => {
        const props: QuestionProps<'RadioBar'> = {
            questionText: 'KEK',
            component: 'RadioBar',
            option: {
                optionProps: {
                    buttons: [
                        { label: 'kek', value: 'kek' },
                        { label: 'lol', value: 'lol' },
                    ],
                    name: 'kek',
                },
            },
            showQuestionText: true,
        }

        it('renders the question text', () => {
            const { getByText } = render(<Question {...props} />)
            expect(getByText(props.questionText)).toBeInTheDocument()
        })

        it('renders the radio bar component', () => {
            const component = render(<Question {...props} />)
            expect(component.getByText('kek')).toBeInTheDocument()
            component.getByText('lol').click()
            expect(component.getByText('lol')).toBeInTheDocument()
        })
    })
    describe('TextInput', () => {
        const props: QuestionProps<'TextInput'> = {
            questionText: 'KEK',
            component: 'TextInput',
            option: {
                optionProps: {
                    label: 'Your Name',
                    placeholder: 'Enter your name',
                    value: 'test',
                    onChange: vi.fn(),
                },
            },
            showQuestionText: true,
        }

        it('renders the question text', () => {
            const { getByText } = render(<Question {...props} />)
            expect(getByText(props.questionText)).toBeInTheDocument()
        })

        it('renders the text input component', () => {
            const component = render(<Question {...props} />)
            expect(component.getByDisplayValue('test')).toBeInTheDocument()
        })
    })
    describe('DynamicComponentRenderer', () => {
        const props: QuestionProps<'TextInput'> = {
            questionText: 'KEK',
            component: 'TextInput',
            option: {
                optionProps: {
                    label: 'Your Name',
                    placeholder: 'Enter your name',
                    value: 'test',
                    onChange: vi.fn(),
                },
            },
        }
        it('renders the dynamic component', () => {
            const component = render(<Question {...props} />)
            expect(component.queryByText('KEK')).toBeNull()
        })
    })
    
    describe('Multiple RadioBar Questions with Same Name', () => {
        it('should keep selections independent when multiple RadioBar components have the same name', () => {
            const questionId1 = 'question-1'
            const questionId2 = 'question-2'

            const props1: QuestionProps<'RadioBar'> = {
                questionText: 'What is your favorite color?',
                component: 'RadioBar',
                option: {
                    optionProps: {
                        buttons: [
                            { label: 'Red', value: 'red' },
                            { label: 'Blue', value: 'blue' },
                        ],
                        // Simulating what the survey page now does: append question ID
                        name: `Select an option-${questionId1}`,
                    },
                },
                showQuestionText: true,
            }

            const props2: QuestionProps<'RadioBar'> = {
                questionText: 'What is your favorite food?',
                component: 'RadioBar',
                option: {
                    optionProps: {
                        buttons: [
                            { label: 'Pizza', value: 'pizza' },
                            { label: 'Pasta', value: 'pasta' },
                        ],
                        // Same base name but different question ID appended
                        name: `Select an option-${questionId2}`,
                    },
                },
                showQuestionText: true,
            }

            const { container } = render(
                <>
                    <Question {...props1} />
                    <Question {...props2} />
                </>
            )

            // Select 'Red' in first question
            const redButton = container.querySelector('button[value="red"]')
            expect(redButton).toBeInTheDocument()
            fireEvent.click(redButton!)

            // Select 'Pizza' in second question
            const pizzaButton = container.querySelector('button[value="pizza"]')
            expect(pizzaButton).toBeInTheDocument()
            fireEvent.click(pizzaButton!)

            // Both selections should remain active
            // With unique names (name-questionId), selections are independent
            const redRadio = container.querySelector('button[value="red"]')
            const pizzaRadio = container.querySelector('button[value="pizza"]')

            expect(redRadio).toHaveAttribute('data-state', 'checked')
            expect(pizzaRadio).toHaveAttribute('data-state', 'checked')
        })
    })
})
