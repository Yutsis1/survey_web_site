import React from 'react'
import { Button } from '../../components/button/button'
import './pop-up.css'

export interface PopUpProps {
    isOpen: boolean
    onClose: () => void
    onCancel?: () => void
    onApply: () => void
    popUpTitle: string
    popUpDescription?: string
    children?: React.ReactNode
}

export const PopUp: React.FC<PopUpProps> = ({
    isOpen,
    onClose,
    onCancel,
    onApply,
    popUpTitle,
    popUpDescription,
    children,
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

                {/* Render children components */}
                <div className="popup-container">
                    {children}
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
