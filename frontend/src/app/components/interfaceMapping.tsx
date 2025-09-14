import { Checkbox, ToggleSwitchProps } from './checkbox/checkbox'
import { RadioBar, RadioBarProps } from './radios/radio-bar'
import { TextFieldProps, TextInput } from './text-field/text-field'
import { Button, ButtonProps } from './button/button'

export interface Option<T> {
    optionProps: T
}

export type ComponentPropsMapping = {
    TextInput: TextFieldProps
    Checkbox: ToggleSwitchProps
    RadioBar: RadioBarProps
    Button: ButtonProps
}

export const componentMapping = {
    TextInput: TextInput,
    Checkbox: Checkbox,
    RadioBar: RadioBar,
    Button: Button,
}
