'use client'
import { useState } from 'react'
import { GridElement } from './app-modules/grid-element/grid-element'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import './styles.css'
import { Sidebar } from './app-modules/sidebar/sidebar'
import { PopUp } from './app-modules/pop-up/pop-up'
import { componentMapping } from './app-modules/interfaceMapping'

export default function Home() {
    const [isChecked, setIsChecked] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const [isPopUpOpen, setIsPopUpOpen] = useState(false)
    const [selectedQuestionType, setSelectedQuestionType] = useState<string>('')
    const [questions, setQuestions] = useState<Array<any>>([])

    const handlePopUpApply = () => {
        if (selectedQuestionType) {
            // Create a new question with grid properties
            const newQuestion = {
                id: `question-${Date.now()}`, // Add unique identifier
                questionText: `New ${selectedQuestionType} Question`,
                component: selectedQuestionType,
                option: {
                    optionProps: {
                        ...(selectedQuestionType === 'Checkbox'
                            ? {
                                  activeLabel: 'ON',
                                  inactiveLabel: 'OFF',
                                  checked: false,
                              }
                            : {}),
                        ...(selectedQuestionType === 'RadioBar'
                            ? {
                                  buttons: Object.keys(componentMapping).map(
                                      (key) => ({
                                          label: key,
                                          value: key,
                                      })
                                  ),
                                  name: 'Select an option',
                                  test_id: 'radio-bar-question-type',
                                //   selectedValue: '',
                              }
                            : {}),
                    },
                },
                // Add grid layout properties
                layout: {
                    i: `question-${Date.now()}`,
                    x: (questions.length * 2) % 12, // Distribute horizontally
                    y: Math.floor((questions.length * 2) / 12), // Move to next row when needed
                    w: 2,
                    h: 2,
                },
            }

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
                                        if (!isDragging) {
                                            setIsChecked(checked)
                                        }
                                    },
                                },
                            },
                        }}
                        layout={[
                            { i: 'default-question', x: 0, y: 0, w: 2, h: 2 },
                        ]}
                    />
                    {/* Render dynamically created questions */}
                    {questions.map((question) => (
                        <GridElement
                            key={question.id}
                            questionProps={question}
                            layout={[question.layout]}
                        />
                    ))}
                </div>
            </main>
            <PopUp
                isOpen={isPopUpOpen}
                onClose={handlePopUpClose}
                onApply={handlePopUpApply}
                onValueChange={(value) => {
                    setSelectedQuestionType(value)
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
                        },
                    },
                ]}
            />
        </div>
    )
}
