'use client'
import { useState, useEffect } from 'react'
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
import { saveSurvey, fetchSurvey } from './services/surveys'
import type { Layouts } from 'react-grid-layout'

export default function Home() {
    const [isPopUpOpen, setIsPopUpOpen] = useState(false)
    const [questions, setQuestions] = useState<QuestionItem[]>([])
    const [draggingId, setDraggingId] = useState<string | null>(null)

    const [isDragging, setIsDragging] = useState(false)
    const [isOverTrash, setIsOverTrash] = useState(false)
    const [saving, setSaving] = useState(false)
    const [loadingSurvey, setLoadingSurvey] = useState(false)

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

    const handleSaveSurvey = async () => {
        setSaving(true)
        try {
            const { id } = await saveSurvey({ questions })
            alert(`Survey saved with id: ${id}`)
        } catch (e) {
            console.error(e)
            alert('Failed to save survey')
        } finally {
            setSaving(false)
        }
    }

    const handleLoadSurvey = async () => {
        const id = prompt('Enter survey id')
        if (!id) return
        setLoadingSurvey(true)
        try {
            const survey = await fetchSurvey(id)
            setQuestions(survey.questions)
            const layouts: Layouts = {
                lg: survey.questions.map(q => q.layout),
                md: survey.questions.map(q => q.layout),
                sm: survey.questions.map(q => q.layout),
                xs: survey.questions.map(q => q.layout),
                xxs: survey.questions.map(q => q.layout),
            }
            layoutsApi.setLayouts(layouts)
            alert('Survey loaded')
        } catch (e) {
            console.error(e)
            alert('Failed to load survey')
        } finally {
            setLoadingSurvey(false)
        }
    }

    const popup = getPopupComponentsAndOptions({
        selectedType: builder.selectedType,
        setSelectedType: builder.setSelectedType,
        setQuestionText: builder.setQuestionText,
        checkbox: builder.checkbox,
        textInput: builder.textInput,
        radioBar: builder.radioBar,
    })

    // Trash (toast) handlers
    const onTrashDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        // Allow dropping
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
    }

    const onTrashDragEnter = () => {
        setIsOverTrash(true)
    }

    const removeQuestions = (id: string) => {
        setQuestions((prev) => prev.filter((it) => it.id !== id))
        builder.reset()
    }

    const onTrashDragLeave = () => {
        setIsOverTrash(false)
    }

    const onTrashDrop = (e: React.DragEvent) => {
        e.preventDefault()
        if (draggingId){
            removeQuestions(draggingId)
        }
        setIsDragging(false)
        setIsOverTrash(false)
    }

    // While react-grid-layout drag is active, track mouse position and set isOverTrash
    // drop idea to use events such as onTrashDrop, onTrashDragLeave etc. 
    // had to move dragable logic in css 
    useEffect(() => {
        // check is dragging or not
        if (!isDragging) return
        const onMove = (ev: MouseEvent) => {
            // select drop element and if we hover on it 
            const dropEl = document.querySelector('.delete-dropzone-card') as HTMLElement | null
            if (!dropEl) return
            // getting coordinates of dropDelete component 
            const rect = dropEl.getBoundingClientRect()
            // calculate is over rectangle of drop component
            const over = ev.clientX >= rect.left && ev.clientX <= rect.right && ev.clientY >= rect.top && ev.clientY <= rect.bottom
            setIsOverTrash(over)
        }
        window.addEventListener('mousemove', onMove)
        return () => {
            // cleanup event listener
            window.removeEventListener('mousemove', onMove)
            setIsOverTrash(false)
        }
    }, [isDragging])

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
                        {
                            label: saving ? 'Saving...' : 'Save Survey',
                            onClick: handleSaveSurvey,
                            className: 'button-base',
                            test_id: 'button-save',
                            disabled: saving,
                        },
                        {
                            label: loadingSurvey ? 'Loading...' : 'Load Survey',
                            onClick: handleLoadSurvey,
                            className: 'button-base',
                            test_id: 'button-load',
                            disabled: loadingSurvey,
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
                        onDragStart={(...args: unknown[]) => {
                            // react-grid-layout passes several args; find an object with an 'i' id
                            const item = args.find((a) => {
                                return typeof a === 'object' && a !== null && 'i' in (a as Record<string, unknown>)
                            }) as Record<string, unknown> | undefined
                            if (item && typeof item.i === 'string') setDraggingId(String(item.i))
                            setIsDragging(true)
                        }}
                        rowHeight={60}
                        isDraggable
                        isResizable
                        compactType={null}
                        preventCollision={false}
                        onDragStop={(layout, layouts) => {
                            // If pointer was over dropzone on stop, remove the dragged item
                            if (isOverTrash && draggingId) {
                                removeQuestions(draggingId)
                            }
                            setIsDragging(false)
                            setDraggingId(null)
                            setIsOverTrash(false)
                            layoutsApi.setLayouts(layouts)
                        }}
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
