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
    onApply: () => void
    popUpTitle: string
    popUpDescription?: string
    components?: [T]
    options?: Option<ComponentPropsMapping[T]>[]
}

export const PopUp: React.FC<
    PopUpProps<keyof ComponentPropsMapping>
> = ({
    isOpen,
    onClose,
    onCancel,
    onApply,
    popUpTitle,
    popUpDescription,
    components,
    options,
}) => {
    if (!isOpen) return null

    React.useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && onClose) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [onClose]);

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
