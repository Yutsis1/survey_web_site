'use client'
import { useState } from 'react'
import { GridElement } from './app-modules/grid-element/grid-element'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import './styles.css'
import { Sidebar } from './app-modules/sidebar/sidebar'
import { PopUp } from './app-modules/pop-up/pop-up'
import {
    componentMapping,
    ComponentPropsMapping,
    Option,
} from './components/interfaceMapping'
import type { Layout } from 'react-grid-layout'
import { DynamicComponentRenderer } from './components/dynamic-component-renderer'

interface QuestionItem {
    id: string
    questionText: string
    component: keyof ComponentPropsMapping
    option: Option<ComponentPropsMapping[keyof ComponentPropsMapping]>
    layout: Layout
}

export default function Home() {
    const [isChecked, setIsChecked] = useState(false)
    const [isPopUpOpen, setIsPopUpOpen] = useState(false)
    const [selectedQuestionType, setSelectedQuestionType] = useState<string>('')
    const [questions, setQuestions] = useState<QuestionItem[]>([])

    const createNewQuestion = (questionType: keyof ComponentPropsMapping): QuestionItem => {
        const baseId = `question-${Date.now()}`
        
        switch (questionType) {
            case 'Checkbox':
                return {
                    id: baseId,
                    questionText: `New ${questionType} Question`,
                    component: 'Checkbox',
                    option: {
                        optionProps: {
                            activeLabel: 'ON',
                            inactiveLabel: 'OFF',
                            checked: false,
                            onChange: (checked: boolean) => console.log('Checkbox changed:', checked),
                        },
                    },
                    layout: {
                        i: baseId,
                        x: (questions.length * 2) % 12,
                        y: Math.floor((questions.length * 2) / 12),
                        w: 2,
                        h: 2,
                    },
                }
            case 'RadioBar':
                return {
                    id: baseId,
                    questionText: `New ${questionType} Question`,
                    component: 'RadioBar',
                    option: {
                        optionProps: {
                            buttons: Object.keys(componentMapping).map((key) => ({
                                label: key,
                                value: key,
                            })),
                            name: 'Select an option',
                            test_id: 'radio-bar-question-type',
                            onChange: (value: string) => console.log('Radio changed:', value),
                        },
                    },
                    layout: {
                        i: baseId,
                        x: (questions.length * 2) % 12,
                        y: Math.floor((questions.length * 2) / 12),
                        w: 2,
                        h: 2,
                    },
                }
            case 'TextInput':
                return {
                    id: baseId,
                    questionText: `New ${questionType} Question`,
                    component: 'TextInput',
                    option: {
                        optionProps: {
                            label: 'Enter text',
                            placeholder: 'Type here...',
                            onChange: (event: React.ChangeEvent<HTMLInputElement>) => 
                                console.log('Text changed:', event.target.value),
                        },
                    },
                    layout: {
                        i: baseId,
                        x: (questions.length * 2) % 12,
                        y: Math.floor((questions.length * 2) / 12),
                        w: 2,
                        h: 2,
                    },
                }
            default:
                throw new Error(`Unsupported question type: ${questionType}`)
        }
    }

    const handlePopUpApply = () => {
        if (selectedQuestionType) {
            const newQuestion = createNewQuestion(selectedQuestionType as keyof ComponentPropsMapping)
            setQuestions([...questions, newQuestion])
        }
        setIsPopUpOpen(false)
        setSelectedQuestionType('')
    }

    const handlePopUpClose = () => {
        setIsPopUpOpen(false)
        setSelectedQuestionType('')
        console.log('Pop-up closed')
    }

    const buttonProps = [
        {
            label: 'New Question',
            onClick: () => {
                setIsPopUpOpen(true)
                console.log('New Question clicked')
            },
            className: 'button-base',
            test_id: 'button-1',
        },
        {
            label: 'Clear Questions',
            onClick: () => {
                setQuestions([]) // Clear all questions
                console.log('Clear clicked')
            },
            className: 'button-base',
            test_id: 'button-2',
        },
    ]

    return (
        <div className="app-container">
            <aside className="sidebar">
                <Sidebar buttons={buttonProps}></Sidebar>
            </aside>
            <main className="content">
                <div className="grid-container">
                    {/* Render existing checkbox question */}
                    <GridElement
                        questionProps={{
                            questionText: 'KEK',
                            component: 'Checkbox',
                            option: {
                                optionProps: {
                                    activeLabel: 'ON',
                                    inactiveLabel: 'OFF',
                                    checked: isChecked,
                                    onChange: (checked: boolean) => {
                                        setIsChecked(checked)
                                    },
                                },
                            },
                        }}
                        layout={[
                            { i: 'default-question', x: 0, y: 0, w: 2, h: 2 },
                        ]}
                        renderComponent={({ questionText, component, option }) => (
                            <DynamicComponentRenderer
                                component={component}
                                option={option}
                                questionText={questionText}
                            />
                        )}
                    />
                    {/* Render dynamically created questions */}
                    {questions.map((question) => (
                        <GridElement
                            key={question.id}
                            questionProps={question}
                            layout={[question.layout]}
                            renderComponent={({ questionText, component, option }) => (
                                <DynamicComponentRenderer
                                    component={component}
                                    option={option}
                                    questionText={questionText}
                                />
                            )}
                        />
                    ))}
                </div>
            </main>
            <PopUp
                isOpen={isPopUpOpen}
                onClose={handlePopUpClose}
                onApply={handlePopUpApply}
                onValueChange={(value) => {
                    setSelectedQuestionType(value as string)
                    console.log('Selected value:', value)
                }}
                popUpTitle="Create New Question"
                popUpDescription="Configure your new question settings below"
                components={['RadioBar']}
                options={[
                    {
                        optionProps: {
                            buttons: Object.keys(componentMapping).map(
                                (key) => ({
                                    label: key,
                                    value: key,
                                })
                            ),
                            name: 'Which question type do you want to create?',
                            test_id: 'radio-bar-question-type',
                            selectedValue: selectedQuestionType,
                            onChange: (value: string) => {
                                setSelectedQuestionType(value)
                            },
                        },
                    },
                ]}
            />
        </div>
    )
}
