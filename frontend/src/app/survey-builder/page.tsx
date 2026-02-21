'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Link as LinkIcon, LayoutGrid, Sparkles } from 'lucide-react'

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
import { TextInput } from '../components/text-field/text-field'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

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
  const [surveyOptions, setSurveyOptions] = useState<Array<{ value: string; label: string }>>([])
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
      const layouts = generateLayouts(survey.questions)
      layoutsApi.setLayouts(layouts)
      alert('Survey loaded')
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
      removeQuestion(draggingId)
    }
    setIsDragging(false)
    setIsOverTrash(false)
  }

  type RGLItem = { i: string; x: number; y: number; w: number; h: number }

  function generateLayouts(items: { id: string }[], cols = 12, w = 3, h = 2) {
    const base: RGLItem[] = items.map((q, idx) => {
      const col = (idx * w) % cols
      const row = Math.floor((idx * w) / cols) * h
      return { i: String(q.id), x: col, y: row, w, h }
    })

    return { lg: base, md: base, sm: base, xs: base, xxs: base } as const
  }

  const surveySharePath = activeSurveyId ? `/survey/${activeSurveyId}` : ''

  return (
    <>
      <div className="app-container">
        <aside className="sidebar border-r border-border bg-[#111111]/70 p-4 backdrop-blur-md">
          <div className="mb-4 rounded-xl border border-border bg-[#0f0f0f] p-4">
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

          <div className="rounded-xl border border-border bg-[#0f0f0f] p-3 text-xs">
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
          <div className="grid-container dot-grid-bg min-h-[calc(100vh-8rem)] rounded-xl border border-border bg-[#0b0b0b] p-2">
            <ResponsiveGridLayout
              className="layout"
              layouts={layoutsApi.layouts}
              onLayoutChange={(_, l) => layoutsApi.setLayouts(l)}
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
                layoutsApi.setLayouts(layouts)
              }}
              onResizeStop={(_, l) => layoutsApi.setLayouts(l)}
            >
              {questions.map((q) => (
                <Card
                  key={q.id}
                  className="grid-item h-full border-border/80 bg-[#111111]/95 p-3 transition hover:border-primary/60 hover:shadow-[0_0_0_1px_rgba(124,58,237,0.35),0_0_24px_rgba(124,58,237,0.2)]"
                >
                  <div className="drag-handle inline-flex rounded-md border border-border bg-[#171717] px-2 py-1 text-xs text-muted-foreground">
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
