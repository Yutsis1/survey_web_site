import React, { Component } from 'react'
import { Button } from '../../components/button/button'
import './pop-up.css'
import {
    componentMapping,
    ComponentPropsMapping,
    Option,
} from '../interfaceMapping'

export interface NewQuestionPopUpProps<T extends keyof ComponentPropsMapping> {
    isOpen: boolean
    onClose: () => void
    onApply: () => void
    popUpTitle: string
    popUpDescription?: string
    components?: [T]
    options?: Option<ComponentPropsMapping[T]>[]
}

export const NewQuestionPopUp: React.FC<
    NewQuestionPopUpProps<keyof ComponentPropsMapping>
> = ({
    isOpen,
    onClose,
    onApply,
    popUpTitle,
    popUpDescription,
    components,
    options,
}) => {
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
                    {components &&
                        options &&
                        components.map((componentType, index) => {
                            const Component = componentMapping[componentType];
                            const option = options[index];
                            return (
                                <div key={index} className="option">
                                    <Component {...option.optionProps as any} /> {/* Cast to any to avoid type issues. Quick fix */}
                                </div>
                            );
                        })}
                </div>

                <div className="popup-buttons">
                    <Button
                        label="Cancel"
                        onClick={onClose}
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
