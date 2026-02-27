import type { Layout } from 'react-grid-layout'
import type { ComponentPropsMapping, Option } from '@/components/app/interfaceMapping'

export interface QuestionItem {
  id: string
  questionText: string
  component: keyof ComponentPropsMapping
  option: Option<ComponentPropsMapping[keyof ComponentPropsMapping]>
  layout: Layout
}

export type CheckboxConfig = { activeLabel: string; inactiveLabel: string; checked: boolean }
export type CheckboxTilesConfig = { name: string; buttons: string[] }
export type TextInputConfig = { label: string; placeholder: string }
export type RadioBarConfig = { name: string; buttons: string[] }
export type DropDownConfig = { options: string[]; selectedOption: string }

export type CreateConfig = {
  questionText: string
  checkbox?: CheckboxConfig
  checkboxTiles?: CheckboxTilesConfig
  textInput?: TextInputConfig
  radioBar?: RadioBarConfig
  dropDown?: DropDownConfig
}
