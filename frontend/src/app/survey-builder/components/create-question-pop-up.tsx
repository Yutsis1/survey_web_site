import { ReactNode } from 'react'
import { PopUp } from '../../app-modules/pop-up/pop-up'

interface CreateQuestionPopUpProps {
  isOpen: boolean
  onClose: () => void
  onApply: () => void
  title: string
  children: ReactNode
}

export function CreateQuestionPopUp({
  isOpen,
  onClose,
  onApply,
  title,
  children,
}: CreateQuestionPopUpProps) {
  return (
    <PopUp
      isOpen={isOpen}
      onClose={onClose}
      onApply={onApply}
      popUpTitle={title}
      popUpDescription="Choose a type and configure its options."
    >
      {children}
    </PopUp>
  )
}
