
import type { Layout } from 'react-grid-layout'
import { CreateConfig, QuestionItem } from './question-types'
import { componentMapping } from '@/app/components/interfaceMapping'

export function createNewQuestion(
  questionType: QuestionItem['component'],
  config: CreateConfig,
  idx: number
): QuestionItem {
  const id = `question-${Date.now()}-${idx}`
  const layout: Layout = { i: id, x: (idx * 2) % 12, y: Math.floor((idx * 2) / 12), w: 2, h: 2 }

  switch (questionType) {
    case 'Checkbox':
      return {
        id,
        questionText: config.questionText || `New ${questionType} Question`,
        component: 'Checkbox',
        option: {
          optionProps: {
            activeLabel: config.checkbox?.activeLabel ?? 'ON',
            inactiveLabel: config.checkbox?.inactiveLabel ?? 'OFF',
            checked: !!config.checkbox?.checked,
            onChange: (checked: boolean) => console.log('Checkbox changed:', checked),
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
            buttons: (config.radioBar?.buttons?.length ? config.radioBar.buttons : Object.keys(componentMapping))
              .map(label => ({ label, value: label })),
            test_id: 'radio-bar-question-type',
            onChange: (v: string) => console.log('Radio changed:', v),
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
    default:
      throw new Error(`Unsupported question type: ${questionType}`)
  }
}
