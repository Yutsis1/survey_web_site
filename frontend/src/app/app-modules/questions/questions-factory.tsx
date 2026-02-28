
import type { Layout } from 'react-grid-layout'
import { CreateConfig, QuestionItem } from './question-types'

const defaultQuestionOptions = ['TextInput', 'Checkbox', 'RadioBar']
const defaultCheckboxTileOptions = ['Option 1', 'Option 2']
const defaultDropDownOptions = ['Option 1', 'Option 2']
type QuestionLayoutPreset = Pick<Layout, 'w' | 'h' | 'minW' | 'minH'>
const GRID_COLS = 12
const GRID_SLOT_WIDTH = 3
const GRID_SLOT_HEIGHT = 3

const DEFAULT_LAYOUT_PRESET: QuestionLayoutPreset = {
  w: 2,
  h: 2,
  minW: undefined,
  minH: undefined,
}

const NON_SHRINKABLE_LAYOUT_PRESET: QuestionLayoutPreset = {
  w: 3,
  h: 3,
  minW: 3,
  minH: 3,
}

const NON_SHRINKABLE_QUESTION_TYPES = new Set<QuestionItem['component']>(['TextInput', 'RadioBar', 'CheckboxTiles'])

function createQuestionLayout(id: string, idx: number, preset: QuestionLayoutPreset): Layout {
  return {
    i: id,
    x: (idx * GRID_SLOT_WIDTH) % GRID_COLS,
    y: Math.floor((idx * GRID_SLOT_WIDTH) / GRID_COLS) * GRID_SLOT_HEIGHT,
    ...preset,
  }
}

export function createNewQuestion(
  questionType: QuestionItem['component'],
  config: CreateConfig,
  idx: number
): QuestionItem {
  const id = `question-${Date.now()}-${idx}`
  const layoutPreset = NON_SHRINKABLE_QUESTION_TYPES.has(questionType)
    ? NON_SHRINKABLE_LAYOUT_PRESET
    : DEFAULT_LAYOUT_PRESET
  const layout = createQuestionLayout(id, idx, layoutPreset)

  switch (questionType) {
    case 'Switch':
      return {
        id,
        questionText: config.questionText || `New ${questionType} Question`,
        component: 'Switch',
        option: {
          optionProps: {
            activeLabel: config.switch?.activeLabel ?? 'ON',
            inactiveLabel: config.switch?.inactiveLabel ?? 'OFF',
            checked: !!config.switch?.checked,
            onChange: (checked: boolean) => console.log('Switch changed:', checked),
          },
        },
        layout,
      }
    case 'RadioBar':
      return {
        id,
        questionText: config.questionText || `New ${questionType} Question`,
        component: 'RadioBar',
        option: {
          optionProps: {
            name: config.radioBar?.name ?? 'Select an option',
            buttons: (config.radioBar?.buttons?.length ? config.radioBar.buttons : defaultQuestionOptions)
              .map(label => ({ label, value: label })),
            test_id: 'radio-bar-question-type',
            onChange: (v: string) => console.log('Radio changed:', v),
          },
        },
        layout,
      }
    case 'CheckboxTiles':
      return {
        id,
        questionText: config.questionText || `New ${questionType} Question`,
        component: 'CheckboxTiles',
        option: {
          optionProps: {
            name: config.checkboxTiles?.name ?? 'Select one or more options',
            buttons: (config.checkboxTiles?.buttons?.length ? config.checkboxTiles.buttons : defaultCheckboxTileOptions)
              .map((label) => ({ label, value: label })),
            test_id: 'checkbox-tiles-question-type',
            onChange: (values: string[]) => console.log('Checkbox tiles changed:', values),
          },
        },
        layout,
      }
    case 'TextInput':
      return {
        id,
        questionText: config.questionText || `New ${questionType} Question`,
        component: 'TextInput',
        option: {
          optionProps: {
            label: config.textInput?.label ?? 'Enter text',
            placeholder: config.textInput?.placeholder ?? 'Type here...',
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => console.log('Text changed:', e.target.value),
          },
        },
        layout,
      }
    case 'DropDown': {
      const options = (config.dropDown?.options?.length ? config.dropDown.options : defaultDropDownOptions)
        .map((option) => option.trim())
        .filter(Boolean)
      const selectedOption = options.includes(config.dropDown?.selectedOption ?? '')
        ? (config.dropDown?.selectedOption as string)
        : (options[0] ?? '')

      return {
        id,
        questionText: config.questionText || `New ${questionType} Question`,
        component: 'DropDown',
        option: {
          optionProps: {
            options: options.map((option) => ({ label: option, value: option })),
            selectedOption,
            onSelect: (value: string) => console.log('Dropdown changed:', value),
          },
        },
        layout,
      }
    }
    default:
      throw new Error(`Unsupported question type: ${questionType}`)
  }
}
