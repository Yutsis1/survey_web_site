import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button as ShadcnButton } from '@/components/ui/button'

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
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{popUpTitle}</DialogTitle>
                    {popUpDescription && (
                        <DialogDescription>{popUpDescription}</DialogDescription>
                    )}
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {children}
                </div>

                <DialogFooter>
                    <ShadcnButton
                        variant="outline"
                        onClick={onCancel ?? onClose}
                        data-testid="cancel-button"
                    >
                        Cancel
                    </ShadcnButton>
                    <ShadcnButton
                        onClick={onApply}
                        disabled={applyDisabled}
                        data-testid="apply-button"
                    >
                        Apply
                    </ShadcnButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
