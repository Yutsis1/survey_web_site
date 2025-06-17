import { Checkbox, ToggleSwitchProps } from '../components/checkbox/checkbox'
import { RadioBar, RadioBarProps } from '../components/radios/radio-bar'
import { TextFieldProps, TextInput } from '../components/text-field/text-field'

export interface Option<T> {
    optionProps: T
}

export type ComponentPropsMapping = {
    TextInput: TextFieldProps
    Checkbox: ToggleSwitchProps
    RadioBar: RadioBarProps
}

export const componentMapping = {
    TextInput: TextInput,
    Checkbox: Checkbox,
    RadioBar: RadioBar,
}
