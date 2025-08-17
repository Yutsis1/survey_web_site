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
import { DeleteDropzone } from './components/deleteDropzone/deleteDropzone'
import './styles.css'

export default function Home() {
    const [isPopUpOpen, setIsPopUpOpen] = useState(false)
    const [questions, setQuestions] = useState<QuestionItem[]>([])
    const [draggingId, setDraggingId] = useState<string | null>(null)

    const [isDragging, setIsDragging] = useState(false)
    const [isOverTrash, setIsOverTrash] = useState(false)

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

    // Helpers

    const onDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
        // Required for HTML5 DnD
        e.dataTransfer.setData('text/plain', String(id))
        e.dataTransfer.effectAllowed = 'move'
    setDraggingId(id)
    setIsDragging(true)
    }

    const onDragEnd = () => {
    setIsDragging(false)
    setDraggingId(null)
    setIsOverTrash(false)
    }
    // Trash (toast) handlers
    const onTrashDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        // Allow dropping
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
    }

    const onTrashDragEnter = () => {
        setIsOverTrash(true)
        // Delete-on-hover behavior (as requested)
        if (draggingId !== null) {
            removeQuestions(draggingId)
            // Reset drag state so the toast can hide cleanly
            setDraggingId(null)
            setIsDragging(false)
            setIsOverTrash(false)
        }
    }

    const removeQuestions = (id: string) => {
        setQuestions((prev) => prev.filter((it) => it.id !== id))
    }

    const onTrashDragLeave = () => {
        setIsOverTrash(false)
    }

    const onTrashDrop = (e: React.DragEvent) => {
        e.preventDefault()
        const id = e.dataTransfer.getData('text/plain')
        if (id) {
            setQuestions((prev) => prev.filter((q) => q.id !== id))
        }
        setIsDragging(false)
        setIsOverTrash(false)
    }

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
                        onDragStart={() => setIsDragging(true)}
                        rowHeight={60}
                        isDraggable
                        isResizable
                        compactType={null}
                        preventCollision={false}
                        onDragStop={(_, l) => {
                            setIsDragging(false)
                            layoutsApi.setLayouts(l)
                        }}
                        onResizeStop={(_, l) => layoutsApi.setLayouts(l)}
                    >
                        {questions.map((q) => (
                            <div
                                key={q.id}
                                className="grid-item"
                            >
                                <div
                                    className="drag-handle"
                                    draggable
                                    onDragStart={(e) => onDragStart(e, q.id)}
                                    onDragEnd={onDragEnd}
                                >
                                    ⋮⋮
                                </div>
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
            {/* Toast-like Delete Dropzone (now a class component) */}
            <DeleteDropzone
                isDragging={isDragging}
                isOverTrash={isOverTrash}
                onDragOver={onTrashDragOver}
                onDragEnter={onTrashDragEnter}
                onDragLeave={onTrashDragLeave}
                onDrop={onTrashDrop}
            />
        </div>
    )
}
