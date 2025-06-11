import React from 'react';
import { Button } from '../../components/button/button';
import './new-question-pop-up.css';

interface NewQuestionPopUpProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: () => void;
}

export const NewQuestionPopUp: React.FC<NewQuestionPopUpProps> = ({
    isOpen,
    onClose,
    onApply
}) => {
    if (!isOpen) return null;

    return (
        <div className="popup-overlay">
            <div className="popup-content">

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
    );
};