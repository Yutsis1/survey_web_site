'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../contexts/auth-context'
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
import { saveSurvey, fetchSurvey, fetchSurveyOptions } from '../services/surveys'
import { TopNav } from '../components/top-nav'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Card } from '@/components/ui/card'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Plus,
    Trash2,
    Save,
    FolderOpen,
    GripVertical,
    Loader2,
    AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import '../app-modules/grid/responsive-grid-layout.css'
import '../app-modules/questions/question.css'

export default function SurveyBuilderPage() {
    const { isAuthenticated, isLoading, logout } = useAuth()
    const router = useRouter()

    const [isPopUpCreationOpen, setIsPopUpCreationOpen] = useState(false)
    const [questions, setQuestions] = useState<QuestionItem[]>([])
    const [draggingId, setDraggingId] = useState<string | null>(null)

    const [isDragging, setIsDragging] = useState(false)
    const [isOverTrash, setIsOverTrash] = useState(false)
    const [saving, setSaving] = useState(false)
    const [surveyTitle, setSurveyTitle] = useState('')

    const [isLoadingPopup, setIsLoadingPopup] = useState(false)
    const [surveyOptions, setSurveyOptions] = useState<
        Array<{ value: string; label: string }>
    >([])
    const [selectedSurveyId, setSelectedSurveyId] = useState('')
    const [activeSurveyId, setActiveSurveyId] = useState<string | null>(null)
    const [loadingSurveyOptions, setLoadingSurveyOptions] = useState(false)
    const [loadingSelectedSurvey, setLoadingSelectedSurvey] = useState(false)
    const [surveyOptionsError, setSurveyOptionsError] = useState<string | null>(null)

    const layoutsApi = useLayouts()
    const builder = useQuestionBuilder()

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/auth')
        }
    }, [isAuthenticated, isLoading, router])

    useEffect(() => {
        if (!isDragging) return
        const onMove = (ev: MouseEvent) => {
            const dropEl = document.querySelector(
                '[aria-label="Delete area"]'
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

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
        )
    }

    if (!isAuthenticated) return null

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
        const trimmedTitle = surveyTitle.trim()
        if (!trimmedTitle) {
            alert('Survey name is required')
            return
        }

        setSaving(true)
        try {
            const { id } = await saveSurvey(
                { title: trimmedTitle, questions },
                activeSurveyId ?? undefined
            )
            setActiveSurveyId(id)
            setSurveyTitle(trimmedTitle)
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
            setSurveyTitle(survey.title?.trim() ?? '')
            setActiveSurveyId(survey.id)
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

    const onTrashDragEnter = () => setIsOverTrash(true)

    const removeQuestions = (id: string) => {
        setQuestions((prev) => {
            const next = prev.filter((it) => it.id !== id)
            const layouts = generateLayouts(next)
            layoutsApi.setLayouts(layouts)
            return next
        })
        builder.reset()
    }

    const onTrashDragLeave = () => setIsOverTrash(false)

    const onTrashDrop = (e: React.DragEvent) => {
        e.preventDefault()
        if (draggingId) removeQuestions(draggingId)
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
        <div className="flex min-h-screen flex-col bg-background">
            <TopNav />
            <div className="flex flex-1">
                {/* Sidebar */}
                <aside className="flex w-[260px] shrink-0 flex-col border-r border-border bg-card/50 p-4">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="survey-title" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Survey Name
                            </Label>
                            <Input
                                id="survey-title"
                                placeholder="Enter survey name..."
                                value={surveyTitle}
                                onChange={(e) => setSurveyTitle(e.target.value)}
                                data-testid="survey-title-input"
                                name="survey-title-input"
                            />
                        </div>

                        <Separator />

                        <div className="flex flex-col gap-2">
                            <Button
                                onClick={() => setIsPopUpCreationOpen(true)}
                                className="justify-start gap-2"
                                data-testid="button-1"
                            >
                                <Plus className="h-4 w-4" />
                                New Question
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setQuestions([])
                                    layoutsApi.reset()
                                }}
                                className="justify-start gap-2"
                                data-testid="button-2"
                            >
                                <Trash2 className="h-4 w-4" />
                                Clear Questions
                            </Button>
                        </div>

                        <Separator />

                        <div className="flex flex-col gap-2">
                            <Button
                                variant="outline"
                                onClick={handleSaveSurvey}
                                disabled={saving}
                                className="justify-start gap-2"
                                data-testid="button-save"
                            >
                                {saving ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Save className="h-4 w-4" />
                                )}
                                {saving ? 'Saving...' : 'Save Survey'}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleLoadSurvey}
                                disabled={loadingSurveyOptions || loadingSelectedSurvey}
                                className="justify-start gap-2"
                                data-testid="button-load"
                            >
                                {loadingSurveyOptions || loadingSelectedSurvey ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <FolderOpen className="h-4 w-4" />
                                )}
                                {loadingSurveyOptions || loadingSelectedSurvey ? 'Loading...' : 'Load Survey'}
                            </Button>
                        </div>
                    </div>

                    {/* Question counter */}
                    <div className="mt-auto pt-4">
                        <Separator className="mb-4" />
                        <p className="text-xs text-muted-foreground">
                            {questions.length} question{questions.length !== 1 ? 's' : ''}
                            {activeSurveyId && (
                                <span className="ml-1 text-primary/70">
                                    {'(saved)'}
                                </span>
                            )}
                        </p>
                    </div>
                </aside>

                {/* Main canvas */}
                <main className="relative flex-1 overflow-y-auto">
                    {/* Dot grid background */}
                    <div
                        className="pointer-events-none absolute inset-0 opacity-[0.04]"
                        style={{
                            backgroundImage: 'radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)',
                            backgroundSize: '20px 20px',
                        }}
                    />

                    <div className="relative z-10 p-4">
                        {questions.length === 0 ? (
                            <div className="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center text-center">
                                <div className="rounded-lg border border-dashed border-border p-12">
                                    <Plus className="mx-auto mb-4 h-10 w-10 text-muted-foreground/50" />
                                    <h3 className="text-lg font-medium text-foreground">No questions yet</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Click &quot;New Question&quot; to start building your survey
                                    </p>
                                </div>
                            </div>
                        ) : (
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
                                    <div key={q.id}>
                                        <Card className="h-full overflow-hidden border-border/50 bg-card hover:border-primary/30 transition-colors">
                                            <div className="flex h-full flex-col">
                                                <div className="drag-handle flex items-center gap-1 border-b border-border/30 px-3 py-1.5 text-muted-foreground">
                                                    <GripVertical className="h-3.5 w-3.5" />
                                                    <span className="text-xs font-medium truncate">{q.questionText}</span>
                                                </div>
                                                <div className="no-drag flex-1 p-3 overflow-auto">
                                                    <DynamicComponentRenderer
                                                        component={q.component}
                                                        option={q.option}
                                                        questionText={q.questionText}
                                                        showQuestionText={false}
                                                    />
                                                </div>
                                            </div>
                                        </Card>
                                    </div>
                                ))}
                            </ResponsiveGridLayout>
                        )}
                    </div>
                </main>
            </div>

            {/* Dialogs */}
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
                <div className="space-y-3">
                    {loadingSurveyOptions ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading surveys...
                        </div>
                    ) : surveyOptionsError ? (
                        <div className="flex items-center gap-2 text-sm text-destructive">
                            <AlertCircle className="h-4 w-4" />
                            {surveyOptionsError}
                        </div>
                    ) : surveyOptions.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No surveys available</p>
                    ) : (
                        <div className="space-y-2">
                            <Label>Saved surveys</Label>
                            <Select value={selectedSurveyId} onValueChange={setSelectedSurveyId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a survey..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {surveyOptions.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
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
