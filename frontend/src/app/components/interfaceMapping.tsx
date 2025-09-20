import { Checkbox, ToggleSwitchProps } from './checkbox/checkbox'
import { RadioBar, RadioBarProps } from './radios/radio-bar'
import { TextFieldProps, TextInput } from './text-field/text-field'
import { Button, ButtonProps } from './button/button'
import { InfoLabel, InfoLabelProps } from './infoLabel/infoLabel'

export interface Option<T> {
    optionProps: T
}

export type ComponentPropsMapping = {
    TextInput: TextFieldProps
    Checkbox: ToggleSwitchProps
    RadioBar: RadioBarProps
    Button: ButtonProps
    InfoLabel: InfoLabelProps
}

export const componentMapping = {
    TextInput: TextInput,
    Checkbox: Checkbox,
    RadioBar: RadioBar,
    Button: Button,
    InfoLabel: InfoLabel,
}
