'use client'
import { useState } from 'react'
import { Sidebar } from './app-modules/sidebar/sidebar'
import { PopUp } from './app-modules/pop-up/pop-up'
import { ResponsiveGridLayout } from './app-modules/grid/responsive-grid-layout'
import { DynamicComponentRenderer } from './components/dynamic-component-renderer'
import type { ComponentPropsMapping } from './components/interfaceMapping'
import { useLayouts } from './app-modules/questions/use-layouts'
import { QuestionItem } from './app-modules/questions/question-types'
import { useQuestionBuilder } from './app-modules/questions/question-builder'
import { getPopupComponentsAndOptions } from './app-modules/pop-up/pop-up-questions-config'
import { createNewQuestion } from './app-modules/questions/questions-factory'
import './styles.css'

export default function Home() {
    const [isPopUpOpen, setIsPopUpOpen] = useState(false)
    const [questions, setQuestions] = useState<QuestionItem[]>([])

    const layoutsApi = useLayouts()
    const builder = useQuestionBuilder()

    const handleApply = () => {
        if (!builder.selectedType) return setIsPopUpOpen(false)
        const item = createNewQuestion(
            builder.selectedType as keyof ComponentPropsMapping,
            builder.buildConfig(),
            questions.length
        )
        layoutsApi.append(item.layout)
        setQuestions((prev) => [...prev, item])
        setIsPopUpOpen(false)
        builder.reset()
    }

    const handleClose = () => {
        setIsPopUpOpen(false)
        builder.reset()
    }

    const popup = getPopupComponentsAndOptions({
        selectedType: builder.selectedType,
        setSelectedType: builder.setSelectedType,
        setQuestionText: builder.setQuestionText,
        checkbox: builder.checkbox,
        textInput: builder.textInput,
        radioBar: builder.radioBar,
    })

    return (
        <div className="app-container">
            <aside className="sidebar">
                <Sidebar
                    buttons={[
                        {
                            label: 'New Question',
                            onClick: () => setIsPopUpOpen(true),
                            className: 'button-base',
                            test_id: 'button-1',
                        },
                        {
                            label: 'Clear Questions',
                            onClick: () => {
                                setQuestions([])
                                layoutsApi.reset()
                            },
                            className: 'button-base',
                            test_id: 'button-2',
                        },
                    ]}
                />
            </aside>

            <main className="content">
                <div className="grid-container">
                    <ResponsiveGridLayout
                        className="layout"
                        layouts={layoutsApi.layouts}
                        onLayoutChange={(_, l) => layoutsApi.setLayouts(l)}
                        rowHeight={60}
                        isDraggable
                        isResizable
                        compactType={null}
                        preventCollision={false}
                        onDragStop={(_, l) => layoutsApi.setLayouts(l)}
                        onResizeStop={(_, l) => layoutsApi.setLayouts(l)}
                    >
                        {questions.map((q) => (
                            <div key={q.id} className="grid-item">
                                <div className="drag-handle">⋮⋮</div>
                                <div className="no-drag">
                                    <DynamicComponentRenderer
                                        component={q.component}
                                        option={q.option}
                                        questionText={q.questionText}
                                    />
                                </div>
                            </div>
                        ))}
                    </ResponsiveGridLayout>
                </div>
            </main>

            <PopUp
                isOpen={isPopUpOpen}
                onClose={handleClose}
                onApply={handleApply}
                popUpTitle={popup.questionText}
                popUpDescription="Choose a type and configure its options."
            >
                {popup.components}
            </PopUp>
        </div>
    )
}
