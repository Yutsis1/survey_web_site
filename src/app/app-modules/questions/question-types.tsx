import type { Layout } from 'react-grid-layout'
import type { ComponentPropsMapping, Option } from '../../components/interfaceMapping'

export interface QuestionItem {
  id: string
  questionText: string
  component: keyof ComponentPropsMapping
  option: Option<ComponentPropsMapping[keyof ComponentPropsMapping]>
  layout: Layout
}

export type CheckboxConfig = { activeLabel: string; inactiveLabel: string; checked: boolean }
export type TextInputConfig = { label: string; placeholder: string }
export type RadioBarConfig = { name: string; buttons: string[] }

export type CreateConfig = {
  questionText: string
  checkbox?: CheckboxConfig
  textInput?: TextInputConfig
  radioBar?: RadioBarConfig
}
