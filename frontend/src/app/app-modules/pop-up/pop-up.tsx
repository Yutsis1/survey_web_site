import React from 'react'
import { Button } from '../../components/button/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'

export interface PopUpProps {
    isOpen: boolean
    onClose: () => void
    onCancel?: () => void
    onApply: () => void
    applyDisabled?: boolean
    popUpTitle: string
    popUpDescription?: string
    children?: React.ReactNode
}

export const PopUp: React.FC<PopUpProps> = ({
    isOpen,
    onClose,
    onCancel,
    onApply,
    applyDisabled = false,
    popUpTitle,
    popUpDescription,
    children,
}) => {
    return (
        <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
            <DialogContent className="popup-content border-border bg-[#111111] sm:max-w-xl" showCloseButton={false}>
                <DialogHeader>
                    <DialogTitle className="popup-title">{popUpTitle}</DialogTitle>
                    {popUpDescription && (
                        <DialogDescription className="popup-description">
                            {popUpDescription}
                        </DialogDescription>
                    )}
                </DialogHeader>

                <div className="popup-container space-y-3 max-h-[55vh] overflow-auto pr-1">
                    {children}
                </div>

                <DialogFooter className="popup-buttons mt-2">
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
                        disabled={applyDisabled}
                    />
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
