import { Checkbox, ToggleSwitchProps } from './checkbox/switch'
import { CheckboxTiles, CheckboxTilesProps } from './checkbox/checkbox-tiles'
import { DropDown, DropDownProps } from './dropDown/dropDown'
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
    CheckboxTiles: CheckboxTilesProps
    DropDown: DropDownProps
    RadioBar: RadioBarProps
    Button: ButtonProps
    InfoLabel: InfoLabelProps
}

export const componentMapping = {
    TextInput: TextInput,
    Checkbox: Checkbox,
    CheckboxTiles: CheckboxTiles,
    DropDown: DropDown,
    RadioBar: RadioBar,
    Button: Button,
    InfoLabel: InfoLabel,
}
