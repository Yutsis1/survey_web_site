'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Link as LinkIcon, LayoutGrid, Sparkles } from 'lucide-react'
import type { Layout, Layouts } from 'react-grid-layout'

import { useAuth } from '../contexts/auth-context'
import { Sidebar } from '../app-modules/sidebar/sidebar'
import { PopUp } from '../app-modules/pop-up/pop-up'
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
import { saveSurvey, fetchSurvey, fetchSurveyOptions } from '../services/surveys'
import { DropDown } from '@/components/app/dropDown/dropDown'
import { TextInput } from '@/components/app/text-field/text-field'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

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
  const initialLoadRef = useRef(false)

  const [isPopUpCreationOpen, setIsPopUpCreationOpen] = useState(false)
  const [questions, setQuestions] = useState<QuestionItem[]>([])
  const [draggingId, setDraggingId] = useState<string | null>(null)

  const [isDragging, setIsDragging] = useState(false)
  const [isOverTrash, setIsOverTrash] = useState(false)
  const [saving, setSaving] = useState(false)
  const [surveyTitle, setSurveyTitle] = useState('')

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
        setActiveSurveyId(survey.id)
        layoutsApi.setLayouts(normalizeLayouts(generateLayouts(survey.questions)))
      })
      .catch((error) => {
        console.error(error)
        alert('Failed to load survey')
      })
      .finally(() => {
        setLoadingSelectedSurvey(false)
      })
  }, [generateLayouts, initialSurveyId, isAuthenticated, isLoading, layoutsApi, normalizeLayouts])

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
      alert('Survey name is required')
      return
    }

    setSaving(true)
    try {
      const { id } = await saveSurvey({ title: trimmedTitle, questions }, activeSurveyId ?? undefined)
      setActiveSurveyId(id)
      setSurveyTitle(trimmedTitle)
      alert(`Survey saved with id: ${id}`)
    } catch (error) {
      console.error(error)
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
      setActiveSurveyId(survey.id)
      const layouts = normalizeLayouts(generateLayouts(survey.questions))
      layoutsApi.setLayouts(layouts)
      handleCloseLoadSurveyPopup()
    } catch (error) {
      console.error(error)
      alert('Failed to load survey')
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
    checkbox: builder.checkbox,
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

  return (
    <>
      <div className="app-container">
        <aside className="sidebar border-r border-border bg-card/70 p-4 backdrop-blur-md">
          <div className="mb-4 rounded-xl border border-border bg-card p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              Survey Builder
            </div>
            <p className="text-xs text-muted-foreground">
              Drag, resize, and configure your survey with modular question cards.
            </p>
          </div>

          <div className="survey-title-field mb-3">
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

          <Separator className="my-4" />

          <div className="rounded-xl border border-border bg-card p-3 text-xs">
            <div className="mb-2 flex items-center gap-2 font-medium text-foreground">
              <LayoutGrid className="h-4 w-4 text-primary" />
              Public Survey Link
            </div>
            {surveySharePath ? (
              <Button
                variant="outline"
                className="w-full justify-start text-xs"
                onClick={() => {
                  const origin = window.location.origin
                  navigator.clipboard.writeText(`${origin}${surveySharePath}`)
                }}
              >
                <LinkIcon className="h-3.5 w-3.5" />
                Copy survey URL
              </Button>
            ) : (
              <p className="text-muted-foreground">Save a survey to generate a shareable link.</p>
            )}
          </div>
        </aside>

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
                    <DynamicComponentRenderer component={q.component} option={q.option} questionText={q.questionText} />
                  </div>
                </Card>
              ))}
            </ResponsiveGridLayout>
          </div>
        </main>
      </div>

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
          <DropDown
            options={surveyOptions}
            selectedOption={selectedSurveyId}
            onSelect={setSelectedSurveyId}
            label="Saved surveys"
            id="saved-surveys"
            name="saved-surveys"
            disabled={loadingSurveyOptions || loadingSelectedSurvey || surveyOptions.length === 0}
          />
          {loadingSurveyOptions && <p className="text-sm text-muted-foreground">Loading surveys...</p>}
          {surveyOptionsError && <p className="text-sm text-destructive">{surveyOptionsError}</p>}
          {!loadingSurveyOptions && !surveyOptionsError && surveyOptions.length === 0 && (
            <p className="text-sm text-muted-foreground">No surveys available</p>
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
    </>
  )
}
