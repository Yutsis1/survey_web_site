import React, { Component } from 'react'
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
    onValueChange?: (value: any) => void // Add this line
    onApply: () => void
    popUpTitle: string
    popUpDescription?: string
    components?: [T]
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
    if (!isOpen) return null

    React.useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && onClose) {
                onClose()
            }
        }

        document.addEventListener('keydown', handleEscape)
        return () => {
            document.removeEventListener('keydown', handleEscape)
        }
    }, [onClose])

    return (
        <div className="popup-overlay">
            <div className="popup-content">
                <h1 className="popup-title">{popUpTitle}</h1>
                {popUpDescription && (
                    <p className="popup-description">{popUpDescription}</p>
                )}

                {/* Render components and options if provided */}
                <div className="popup-container">
                    {components &&
                        options &&
                        components.map((componentType, index) => {
                            const Component = componentMapping[componentType]
                            const option = options[index]
                            // Enhance the option props with the onValueChange callback
                            const enhancedProps = {
                                ...option.optionProps,
                                onChange: (
                                    value: ComponentPropsMapping[typeof componentType]['onChange'] extends (
                                        value: infer T
                                    ) => void
                                        ? T
                                        : never
                                ) => {
                                    // Call the original onChange if it exists
                                    option.optionProps.onChange?.(value)
                                    // Call the PopUp's onValueChange callback
                                    onValueChange?.(value)
                                },
                            }

                            return (
                                <div key={index} className="option">
                                    <Component {...(enhancedProps as any)} />
                                    {/* Cast to any to avoid type issues. Quick fix */}
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
