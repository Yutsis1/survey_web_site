import React from 'react'
import { Button } from '../../components/button/button'
import './pop-up.css'
import {
    ComponentPropsMapping,
    Option,
} from '../interfaceMapping'
import { Checkbox, ToggleSwitchProps } from '../../components/checkbox/checkbox'
import { TextInput, TextFieldProps } from '../../components/text-field/text-field'
import { RadioBar, RadioBarProps } from '../../components/radios/radio-bar'

export interface PopUpProps {
    isOpen: boolean
    onClose: () => void
    onCancel?: () => void
    onValueChange?: (
        value: string | boolean | React.ChangeEvent<HTMLInputElement>
    ) => void
    onApply: () => void
    popUpTitle: string
    popUpDescription?: string
    components?: (keyof ComponentPropsMapping)[]
    options?: Option<ComponentPropsMapping[keyof ComponentPropsMapping]>[]
}

export const PopUp: React.FC<PopUpProps> = ({
    isOpen,
    onClose,
    onCancel,
    onApply,
    onValueChange,
    popUpTitle,
    popUpDescription,
    components,
    options,
}) => {
    React.useEffect(() => {
        if (!isOpen) return
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose()
            }
        }

        document.addEventListener('keydown', handleEscape)
        return () => {
            document.removeEventListener('keydown', handleEscape)
        }
    }, [isOpen, onClose])

    if (!isOpen) return null

    return (
        <div className="popup-overlay">
            <div className="popup-content">
                <h1 className="popup-title">{popUpTitle}</h1>
                {popUpDescription && (
                    <p className="popup-description">{popUpDescription}</p>
                )}

                {/* Render components and options if provided */}
                <div className="popup-container">
                    {components?.map((componentType, index) => {
                        const option = options?.[index]
                        if (!option) return null

                        switch (componentType) {
                            case 'TextInput': {
                                const props =
                                    option.optionProps as TextFieldProps
                                return (
                                    <div key={index} className="option">
                                        <TextInput
                                            {...props}
                                            onChange={(event) => {
                                                props.onChange(event)
                                                onValueChange?.(event)
                                            }}
                                        />
                                    </div>
                                )
                            }
                            case 'Checkbox': {
                                const props =
                                    option.optionProps as ToggleSwitchProps
                                return (
                                    <div key={index} className="option">
                                        <Checkbox
                                            {...props}
                                            onChange={(checked) => {
                                                props.onChange(checked)
                                                onValueChange?.(checked)
                                            }}
                                        />
                                    </div>
                                )
                            }
                            case 'RadioBar': {
                                const props = option.optionProps as RadioBarProps
                                return (
                                    <div key={index} className="option">
                                        <RadioBar
                                            {...props}
                                            onChange={(value: string) => {
                                                props.onChange?.(value)
                                                onValueChange?.(value)
                                            }}
                                        />
                                    </div>
                                )
                            }
                            default:
                                return null
                        }
                    })}
                </div>

                <div className="popup-buttons">
                    <Button
                        label="Cancel"
                        onClick={onCancel ?? onClose}
                        test_id="cancel-button"
                        className="button-secondary"
                    />
                    <Button
                        label="Apply"
                        onClick={onApply}
                        test_id="apply-button"
                        // className="button-cancel"
                    />
                </div>
            </div>
        </div>
    )
}
