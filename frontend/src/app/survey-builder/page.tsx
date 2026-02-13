'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../contexts/auth-context'
import { Sidebar } from '../app-modules/sidebar/sidebar'
import { PopUp } from '../app-modules/pop-up/pop-up'
import { ResponsiveGridLayout } from '../app-modules/grid/responsive-grid-layout'
import { DynamicComponentRenderer } from '../components/dynamic-component-renderer'
import type { ComponentPropsMapping } from '../components/interfaceMapping'
import { useLayouts } from '../app-modules/questions/use-layouts'
import { QuestionItem } from '../app-modules/questions/question-types'
import { useQuestionBuilder } from '../app-modules/questions/question-builder'
import { getPopupComponentsAndOptions } from '../app-modules/pop-up/pop-up-questions-config'
import { createNewQuestion } from '../app-modules/questions/questions-factory'
import { DeleteDropzone } from '../components/deleteDropzone/deleteDropzone'
import '../styles.css'
import { saveSurvey, fetchSurvey, fetchSurveyOptions } from '../services/surveys'
import { DropDown } from '../components/dropDown/dropDown'

export default function Home() {
    const { isAuthenticated, isLoading, logout } = useAuth()
    const router = useRouter()

    // creation popup state
    const [isPopUpCreationOpen, setIsPopUpCreationOpen] = useState(false)
    const [questions, setQuestions] = useState<QuestionItem[]>([])
    const [draggingId, setDraggingId] = useState<string | null>(null)

    // deletion dropdown
    const [isDragging, setIsDragging] = useState(false)
    const [isOverTrash, setIsOverTrash] = useState(false)
    const [saving, setSaving] = useState(false)

    // load popups and question
    const [isLoadingPopup, setIsLoadingPopup] = useState(false)
    const [surveyOptions, setSurveyOptions] = useState<
        Array<{ value: string; label: string }>
    >([])
    const [selectedSurveyId, setSelectedSurveyId] = useState('')
    const [loadingSurveyOptions, setLoadingSurveyOptions] = useState(false)
    const [loadingSelectedSurvey, setLoadingSelectedSurvey] = useState(false)
    const [surveyOptionsError, setSurveyOptionsError] = useState<string | null>(null)

    // layouts state management
    const layoutsApi = useLayouts()
    const builder = useQuestionBuilder()

    // Redirect if not authenticated
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/auth')
        }
    }, [isAuthenticated, isLoading, router])

    // While react-grid-layout drag is active, track mouse position and set isOverTrash
    useEffect(() => {
        if (!isDragging) return
        const onMove = (ev: MouseEvent) => {
            const dropEl = document.querySelector(
                '.delete-dropzone-card'
            ) as HTMLElement | null
            if (!dropEl) return
            const rect = dropEl.getBoundingClientRect()
            const over =
                ev.clientX >= rect.left &&
                ev.clientX <= rect.right &&
                ev.clientY >= rect.top &&
                ev.clientY <= rect.bottom
            setIsOverTrash(over)
        }
        window.addEventListener('mousemove', onMove)
        return () => {
            window.removeEventListener('mousemove', onMove)
            setIsOverTrash(false)
        }
    }, [isDragging])

    // Show loading while checking auth
    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                Loading...
            </div>
        )
    }

    // Don't render if not authenticated (will redirect)
    if (!isAuthenticated) {
        return null
    }

    const handleApply = () => {
        if (!builder.selectedType) return setIsPopUpCreationOpen(false)
        const item = createNewQuestion(
            builder.selectedType as keyof ComponentPropsMapping,
            builder.buildConfig(),
            questions.length
        )

        const cols = 12
        const w = 3
        const h = 2
        const idx = questions.length
        const col = (idx * w) % cols
        const row = Math.floor((idx * w) / cols) * h

        layoutsApi.append({ i: String(item.id), x: col, y: row, w, h })

        setQuestions((prev) => [...prev, item])
        setIsPopUpCreationOpen(false)
        builder.reset()
    }

    const handleClose = () => {
        setIsPopUpCreationOpen(false)
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

    const resetLoadSurveyPopupState = () => {
        setSurveyOptions([])
        setSelectedSurveyId('')
        setSurveyOptionsError(null)
        setLoadingSurveyOptions(false)
        setLoadingSelectedSurvey(false)
    }

    const handleCloseLoadSurveyPopup = () => {
        setIsLoadingPopup(false)
        resetLoadSurveyPopupState()
    }

    const handleLoadSurvey = async () => {
        setIsLoadingPopup(true)
        setSurveyOptions([])
        setSelectedSurveyId('')
        setSurveyOptionsError(null)
        setLoadingSurveyOptions(true)

        try {
            const options = await fetchSurveyOptions()
            const mappedOptions = options.map((option) => {
                const title = option.title?.trim() || 'Untitled Survey'
                return {
                    value: option.id,
                    label: `${title} (${option.id.slice(-8)})`,
                }
            })
            setSurveyOptions(mappedOptions)
            setSelectedSurveyId(mappedOptions[0]?.value ?? '')
        } catch (e) {
            console.error(e)
            setSurveyOptionsError('Failed to load surveys')
        } finally {
            setLoadingSurveyOptions(false)
        }
    }

    const handleApplyLoadSurvey = async () => {
        if (!selectedSurveyId) return
        setLoadingSelectedSurvey(true)
        try {
            const survey = await fetchSurvey(selectedSurveyId)
            setQuestions(survey.questions)
            const layouts = generateLayouts(survey.questions)
            layoutsApi.setLayouts(layouts)
            alert('Survey loaded')
            handleCloseLoadSurveyPopup()
        } catch (e) {
            console.error(e)
            alert('Failed to load survey')
        } finally {
            setLoadingSelectedSurvey(false)
        }
    }

    const handleLogout = async () => {
        try {
            await logout()
            router.push('/auth')
        } catch (e) {
            console.error('Logout failed:', e)
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

    const onTrashDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
    }

    const onTrashDragEnter = () => {
        setIsOverTrash(true)
    }

    const removeQuestions = (id: string) => {
        setQuestions((prev) => {
            const next = prev.filter((it) => it.id !== id)
            const layouts = generateLayouts(next)
            layoutsApi.setLayouts(layouts)
            return next
        })
        builder.reset()
    }

    const onTrashDragLeave = () => {
        setIsOverTrash(false)
    }

    const onTrashDrop = (e: React.DragEvent) => {
        e.preventDefault()
        if (draggingId) {
            removeQuestions(draggingId)
        }
        setIsDragging(false)
        setIsOverTrash(false)
    }

    type RGLItem = { i: string; x: number; y: number; w: number; h: number }

    function generateLayouts(
        questions: { id: string }[],
        cols = 12,
        w = 3,
        h = 2
    ) {
        const base: RGLItem[] = questions.map((q, idx) => {
            const col = (idx * w) % cols
            const row = Math.floor((idx * w) / cols) * h
            return { i: String(q.id), x: col, y: row, w, h }
        })
        return { lg: base, md: base, sm: base, xs: base, xxs: base } as const
    }

    return (
        <div className="app-container">
            <aside className="sidebar">
                <Sidebar
                    buttons={[
                        {
                            label: 'New Question',
                            onClick: () => setIsPopUpCreationOpen(true),
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
                            label:
                                loadingSurveyOptions || loadingSelectedSurvey
                                    ? 'Loading...'
                                    : 'Load Survey',
                            onClick: handleLoadSurvey,
                            className: 'button-base',
                            test_id: 'button-load',
                            disabled:
                                loadingSurveyOptions || loadingSelectedSurvey,
                        },
                        {
                            label: 'Logout',
                            onClick: handleLogout,
                            className: 'button-base',
                            test_id: 'button-logout',
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
                            const item = args.find((a) => {
                                return (
                                    typeof a === 'object' &&
                                    a !== null &&
                                    'i' in (a as Record<string, unknown>)
                                )
                            }) as Record<string, unknown> | undefined
                            if (item && typeof item.i === 'string')
                                setDraggingId(String(item.i))
                            setIsDragging(true)
                        }}
                        rowHeight={60}
                        isDraggable
                        isResizable
                        compactType={null}
                        preventCollision={false}
                        onDragStop={(layout, layouts) => {
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
                isOpen={isPopUpCreationOpen}
                onClose={handleClose}
                onApply={handleApply}
                popUpTitle={popup.questionText}
                popUpDescription="Choose a type and configure its options."
            >
                {popup.components}
            </PopUp>
            <PopUp
                isOpen={isLoadingPopup}
                onClose={handleCloseLoadSurveyPopup}
                onCancel={handleCloseLoadSurveyPopup}
                onApply={handleApplyLoadSurvey}
                applyDisabled={
                    loadingSurveyOptions ||
                    loadingSelectedSurvey ||
                    surveyOptions.length === 0 ||
                    !selectedSurveyId
                }
                popUpTitle="Load Survey"
                popUpDescription="Select a saved survey to load."
            >
                <div>
                    <DropDown
                        options={surveyOptions}
                        selectedOption={selectedSurveyId}
                        onSelect={setSelectedSurveyId}
                        label="Saved surveys"
                        id="saved-surveys"
                        name="saved-surveys"
                        disabled={
                            loadingSurveyOptions ||
                            loadingSelectedSurvey ||
                            surveyOptions.length === 0
                        }
                    />
                    {loadingSurveyOptions && <p>Loading surveys...</p>}
                    {surveyOptionsError && <p>{surveyOptionsError}</p>}
                    {!loadingSurveyOptions &&
                        !surveyOptionsError &&
                        surveyOptions.length === 0 && <p>No surveys available</p>}
                </div>
            </PopUp>
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
