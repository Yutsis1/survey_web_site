'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Link as LinkIcon, LayoutGrid, Sparkles } from 'lucide-react'
import type { Layout, Layouts } from 'react-grid-layout'

import { useAuth } from '../contexts/auth-context'
import { Sidebar, Section, ButtonGroup } from '../app-modules/sidebar'
import { ResponsiveGridLayout } from '../app-modules/grid/responsive-grid-layout'
import { DynamicComponentRenderer } from '@/components/app/dynamic-component-renderer'
import type { ComponentPropsMapping } from '@/components/app/interfaceMapping'
import { useLayouts } from '../app-modules/questions/use-layouts'
import { QuestionItem } from '../app-modules/questions/question-types'
import { useQuestionBuilder } from '../app-modules/questions/question-builder'
import { getPopupComponentsAndOptions } from '../app-modules/pop-up/pop-up-questions-config'
import { createNewQuestion } from '../app-modules/questions/questions-factory'
import { DeleteDropzone } from '@/components/app/deleteDropzone/deleteDropzone'
import '../styles.css'
import { saveSurvey, fetchSurvey, fetchSurveyOptions, SurveyStatus } from '../services/surveys'
import { TextInput } from '@/components/app/text-field/text-field'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { CreateQuestionPopUp } from './components/create-question-pop-up'
import { LoadSurveyPopUp } from './components/load-survey-pop-up'
import { useToast } from '@/components/app/toast'

interface SurveyBuilderClientProps {
  initialSurveyId?: string
}

const NON_SHRINKABLE_LAYOUT = {
  w: 3,
  h: 3,
  minW: 3,
  minH: 3,
} as const

const NON_SHRINKABLE_COMPONENTS = new Set<QuestionItem['component']>(['TextInput', 'RadioBar', 'CheckboxTiles'])

export function SurveyBuilderClient({ initialSurveyId }: SurveyBuilderClientProps) {
  const { isAuthenticated, isLoading, logout } = useAuth()
  const router = useRouter()
  const { notify } = useToast()
  const initialLoadRef = useRef(false)

  const [isPopUpCreationOpen, setIsPopUpCreationOpen] = useState(false)
  const [questions, setQuestions] = useState<QuestionItem[]>([])
  const [draggingId, setDraggingId] = useState<string | null>(null)

  const [isDragging, setIsDragging] = useState(false)
  const [isOverTrash, setIsOverTrash] = useState(false)
  const [saving, setSaving] = useState(false)
  const [surveyTitle, setSurveyTitle] = useState('')
  const [surveyStatus, setSurveyStatus] = useState<SurveyStatus>('draft')

  const [isLoadingPopup, setIsLoadingPopup] = useState(false)
  const [surveyOptions, setSurveyOptions] = useState<Array<{ value: string; label: string }>>([])
  const [selectedSurveyId, setSelectedSurveyId] = useState('')
  const [activeSurveyId, setActiveSurveyId] = useState<string | null>(null)
  const [loadingSurveyOptions, setLoadingSurveyOptions] = useState(false)
  const [loadingSelectedSurvey, setLoadingSelectedSurvey] = useState(false)
  const [surveyOptionsError, setSurveyOptionsError] = useState<string | null>(null)

  const layoutsApi = useLayouts()
  const builder = useQuestionBuilder()

  const normalizeLayoutItem = useCallback(
    (layoutItem: Layout): Layout => {
      const question = questions.find((q) => q.id === layoutItem.i)
      const shouldClampByQuestion = !!question && NON_SHRINKABLE_COMPONENTS.has(question.component)
      const shouldClampByExistingMin =
        layoutItem.minW === NON_SHRINKABLE_LAYOUT.minW && layoutItem.minH === NON_SHRINKABLE_LAYOUT.minH

      if (!shouldClampByQuestion && !shouldClampByExistingMin) {
        return layoutItem
      }

      return {
        ...layoutItem,
        minW: NON_SHRINKABLE_LAYOUT.minW,
        minH: NON_SHRINKABLE_LAYOUT.minH,
        w: Math.max(layoutItem.w, NON_SHRINKABLE_LAYOUT.minW),
        h: Math.max(layoutItem.h, NON_SHRINKABLE_LAYOUT.minH),
      }
    },
    [questions]
  )

  const normalizeLayouts = useCallback(
    (inputLayouts: Layouts): Layouts =>
      Object.fromEntries(
        Object.entries(inputLayouts).map(([breakpoint, breakpointLayouts]) => [
          breakpoint,
          (breakpointLayouts ?? []).map(normalizeLayoutItem),
        ])
      ) as Layouts,
    [normalizeLayoutItem]
  )

  const generateLayouts = useCallback((items: QuestionItem[], cols = 12, w = 3, h = 2): Layouts => {
    const rowHeight = Math.max(h, NON_SHRINKABLE_LAYOUT.h)
    const base: Layout[] = items.map((q, idx) => {
      const col = (idx * w) % cols
      const row = Math.floor((idx * w) / cols) * rowHeight
      const isNonShrinkable = NON_SHRINKABLE_COMPONENTS.has(q.component)

      return {
        i: String(q.id),
        x: col,
        y: row,
        w: isNonShrinkable ? NON_SHRINKABLE_LAYOUT.w : w,
        h: isNonShrinkable ? NON_SHRINKABLE_LAYOUT.h : h,
        minW: isNonShrinkable ? NON_SHRINKABLE_LAYOUT.minW : undefined,
        minH: isNonShrinkable ? NON_SHRINKABLE_LAYOUT.minH : undefined,
      }
    })

    return { lg: base, md: base, sm: base, xs: base, xxs: base }
  }, [])

  const hasLayoutEntries = useCallback((layouts?: Layouts | null) => {
    if (!layouts) return false
    return Object.values(layouts).some((breakpointLayouts) => (breakpointLayouts ?? []).length > 0)
  }, [])

  const buildPersistedLayouts = useCallback(
    (sourceLayouts: Layouts, items: QuestionItem[]): Layouts => {
      const questionIds = new Set(items.map((question) => question.id))
      const filtered = Object.fromEntries(
        Object.entries(sourceLayouts).map(([breakpoint, breakpointLayouts]) => [
          breakpoint,
          (breakpointLayouts ?? []).filter((layoutItem) => questionIds.has(layoutItem.i)),
        ])
      ) as Layouts

      return normalizeLayouts(filtered)
    },
    [normalizeLayouts]
  )

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth')
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    if (!isDragging) return

    const onMove = (ev: MouseEvent) => {
      const dropEl = document.querySelector('.delete-dropzone-card') as HTMLElement | null
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

  useEffect(() => {
    if (!initialSurveyId || initialLoadRef.current) return
    if (isLoading || !isAuthenticated) return

    initialLoadRef.current = true
    setLoadingSelectedSurvey(true)

    fetchSurvey(initialSurveyId)
      .then((survey) => {
        setQuestions(survey.questions)
        setSurveyTitle(survey.title?.trim() ?? '')
        setSurveyStatus(survey.status ?? 'draft')
        setActiveSurveyId(survey.id)
        const nextLayouts = hasLayoutEntries(survey.layouts)
          ? normalizeLayouts(survey.layouts)
          : normalizeLayouts(generateLayouts(survey.questions))
        layoutsApi.setLayouts(nextLayouts)
      })
      .catch((error) => {
        console.error(error)
        notify({ type: 'error', title: 'Failed to load survey' })
      })
      .finally(() => {
        setLoadingSelectedSurvey(false)
      })
  }, [generateLayouts, hasLayoutEntries, initialSurveyId, isAuthenticated, isLoading, layoutsApi, normalizeLayouts])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-md border border-border bg-card px-4 py-2 text-sm text-muted-foreground">
          Loading...
        </div>
      </div>
    )
  }

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

    layoutsApi.append(item.layout)

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
      notify({ type: 'warning', title: 'Survey name is required' })
      return
    }

    setSaving(true)
    try {
      const persistedLayouts = buildPersistedLayouts(layoutsApi.layouts, questions)
      const { id } = await saveSurvey(
        {
          title: trimmedTitle,
          status: surveyStatus,
          questions,
          layouts: persistedLayouts,
        },
        activeSurveyId ?? undefined
      )
      setActiveSurveyId(id)
      setSurveyTitle(trimmedTitle)
      notify({ type: 'success', title: 'Survey saved successfully' })
    } catch (error) {
      console.error(error)
      notify({ type: 'error', title: 'Failed to save survey' })
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
    } catch (error) {
      console.error(error)
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
      setSurveyStatus(survey.status ?? 'draft')
      setActiveSurveyId(survey.id)
      const layouts = hasLayoutEntries(survey.layouts)
        ? normalizeLayouts(survey.layouts)
        : normalizeLayouts(generateLayouts(survey.questions))
      layoutsApi.setLayouts(layouts)
      handleCloseLoadSurveyPopup()
    } catch (error) {
      console.error(error)
      notify({ type: 'error', title: 'Failed to load survey' })
    } finally {
      setLoadingSelectedSurvey(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/auth')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const popup = getPopupComponentsAndOptions({
    selectedType: builder.selectedType,
    setSelectedType: builder.setSelectedType,
    setQuestionText: builder.setQuestionText,
    switch: builder.switch,
    textInput: builder.textInput,
    radioBar: builder.radioBar,
    checkboxTiles: builder.checkboxTiles,
    dropDown: builder.dropDown,
  })

  const onTrashDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const onTrashDragEnter = () => {
    setIsOverTrash(true)
  }

  const removeQuestion = (id: string) => {
    setQuestions((prev) => {
      const next = prev.filter((it) => it.id !== id)
      const layouts = normalizeLayouts(generateLayouts(next))
      layoutsApi.setLayouts(layouts)
      return next
    })
    builder.reset()
  }

  const updateQuestionTitle = (id: string, questionText: string) => {
    setQuestions((prev) =>
      prev.map((question) => (question.id === id ? { ...question, questionText } : question))
    )
  }

  const onTrashDragLeave = () => {
    setIsOverTrash(false)
  }

  const onTrashDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (draggingId) {
      removeQuestion(draggingId)
    }
    setIsDragging(false)
    setIsOverTrash(false)
  }

  const surveySharePath = activeSurveyId ? `/survey/${activeSurveyId}` : ''

  const handleCopyPublicSurvey = async () => {
    if (!activeSurveyId) {
      notify({ type: 'info', title: "Survey isn't saved. Please save it first." })
      return
    }

    if (surveyStatus !== 'published') {
      notify({ type: 'warning', title: "Survey isn't published. Please publish it first." })
      return
    }

    try {
      const origin = window.location.origin
      await navigator.clipboard.writeText(`${origin}${surveySharePath}`)
      notify({ type: 'success', title: 'Public survey link copied' })
    } catch (error) {
      console.error(error)
      notify({ type: 'error', title: 'Failed to copy public survey link' })
    }
  }

  return (
    <>
      <div className="app-container">
        <Sidebar>
          <Section
            title="Survey Builder"
            description="Drag, resize, and configure your survey with modular question cards."
            icon={Sparkles}
          />

          <Section title="Survey Details" contentClassName="space-y-3">
            <div className="survey-title-field">
              <TextInput
                label="Survey Name"
                placeholder="Enter survey name..."
                value={surveyTitle}
                onChange={(e) => setSurveyTitle(e.target.value)}
                id="survey-title-input"
                name="survey-title-input"
                test_id="survey-title-input"
              />
            </div>

            <div>
              <label htmlFor="survey-status" className="mb-1 block text-xs font-medium text-foreground">
                Survey Status
              </label>
              <select
                id="survey-status"
                data-testid="survey-status-select"
                className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
                value={surveyStatus}
                onChange={(event) => setSurveyStatus(event.target.value as SurveyStatus)}
              >
                <option value="draft">draft</option>
                <option value="published">published</option>
              </select>
            </div>
          </Section>

          <Section title="Actions">
            <ButtonGroup
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
                    setSurveyStatus('draft')
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
                  label: loadingSurveyOptions || loadingSelectedSurvey ? 'Loading...' : 'Load Survey',
                  onClick: handleLoadSurvey,
                  className: 'button-base',
                  test_id: 'button-load',
                  disabled: loadingSurveyOptions || loadingSelectedSurvey,
                },
                {
                  label: 'Logout',
                  onClick: handleLogout,
                  className: 'button-base',
                  test_id: 'button-logout',
                },
              ]}
            />
          </Section>

          <Separator className="my-4" />

          <Section title="Public Survey Link" icon={LayoutGrid} contentClassName="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start text-xs"
              data-testid="button-copy-public-survey"
              onClick={handleCopyPublicSurvey}
            >
              <LinkIcon className="h-3.5 w-3.5" />
              Copy public survey
            </Button>
            {!activeSurveyId && <p className="text-xs text-muted-foreground">Save survey first to get a public link.</p>}
            {activeSurveyId && surveyStatus !== 'published' && (
              <p className="text-xs text-muted-foreground">Publish survey to make the link accessible.</p>
            )}
          </Section>
        </Sidebar>

        <main className="content">
          <div className="grid-container dot-grid-bg min-h-[calc(100vh-8rem)] rounded-xl border border-border bg-background p-2">
            <ResponsiveGridLayout
              className="layout"
              layouts={layoutsApi.layouts}
              onLayoutChange={(_, l) => layoutsApi.setLayouts(normalizeLayouts(l))}
              onDragStart={(...args: unknown[]) => {
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
                if (isOverTrash && draggingId) {
                  removeQuestion(draggingId)
                }
                setIsDragging(false)
                setDraggingId(null)
                setIsOverTrash(false)
                layoutsApi.setLayouts(normalizeLayouts(layouts))
              }}
              onResizeStop={(_, l) => layoutsApi.setLayouts(normalizeLayouts(l))}
            >
              {questions.map((q) => (
                <Card
                  key={q.id}
                  className="grid-item h-full border-border/80 bg-card/95 p-3 transition hover:border-primary/60 hover:shadow-[0_0_0_1px_rgba(124,58,237,0.35),0_0_24px_rgba(124,58,237,0.2)]"
                >
                  <div className="drag-handle inline-flex rounded-md border border-border bg-secondary px-2 py-1 text-xs text-muted-foreground">
                    Drag
                  </div>
                  <div className="no-drag mt-3">
                    <input
                      type="text"
                      aria-label="Question title"
                      value={q.questionText}
                      onChange={(event) => updateQuestionTitle(q.id, event.target.value)}
                      id={`question-title-${q.id}`}
                      name={`question-title-${q.id}`}
                      className="mb-0 h-6 w-full rounded-md border border-input bg-background px-2 text-xs text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      data-testid={`question-title-input-${q.id}`}
                    />
                    <span className="sr-only">{q.questionText}</span>
                    <DynamicComponentRenderer
                      component={q.component}
                      option={q.option}
                      questionText={q.questionText}
                      showQuestionText={false}
                    />
                  </div>
                </Card>
              ))}
            </ResponsiveGridLayout>
          </div>
        </main>
      </div>

      <CreateQuestionPopUp
        isOpen={isPopUpCreationOpen}
        onClose={handleClose}
        onApply={handleApply}
        title={popup.questionText}
      >
        {popup.components}
      </CreateQuestionPopUp>

      <LoadSurveyPopUp
        isOpen={isLoadingPopup}
        onClose={handleCloseLoadSurveyPopup}
        onApply={handleApplyLoadSurvey}
        loadingSurveyOptions={loadingSurveyOptions}
        loadingSelectedSurvey={loadingSelectedSurvey}
        surveyOptions={surveyOptions}
        surveyOptionsError={surveyOptionsError}
        selectedSurveyId={selectedSurveyId}
        setSelectedSurveyId={setSelectedSurveyId}
      />

      <DeleteDropzone
        isDragging={isDragging}
        isOverTrash={isOverTrash}
        onDragOver={onTrashDragOver}
        onDragEnter={onTrashDragEnter}
        onDragLeave={onTrashDragLeave}
        onDrop={onTrashDrop}
      />
    </>
  )
}
