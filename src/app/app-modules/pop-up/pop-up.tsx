import React from 'react'
import { Button } from '../../components/button/button'
import './pop-up.css'
import {
    componentMapping,
    ComponentPropsMapping,
    Option,
} from '../interfaceMapping'

export interface PopUpProps<T extends keyof ComponentPropsMapping> {
    isOpen: boolean
    onClose: () => void
    onCancel?: () => void
    onValueChange?: (
        value: Parameters<
            NonNullable<ComponentPropsMapping[T]['onChange']>
        >[0]
    ) => void
    onApply: () => void
    popUpTitle: string
    popUpDescription?: string
    components?: T[]
    options?: Option<ComponentPropsMapping[T]>[]
}

export const PopUp: React.FC<PopUpProps<keyof ComponentPropsMapping>> = ({
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
                        const Component = componentMapping[componentType]
                        // Enhance the option props with the onValueChange callback
                        const enhancedProps: ComponentPropsMapping[typeof componentType] = {
                            ...option.optionProps,
                            onChange: (
                                value: Parameters<
                                    NonNullable<
                                        ComponentPropsMapping[typeof componentType]['onChange']
                                    >
                                >[0]
                            ) => {
                                option.optionProps.onChange?.(value)
                                onValueChange?.(value)
                            },
                        }

                        return (
                            <div key={index} className="option">
                                <Component
                                    {...(enhancedProps as ComponentPropsMapping[typeof componentType])}
                                />
                            </div>
                        )
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
