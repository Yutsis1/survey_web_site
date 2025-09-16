import React from 'react';
import '../../styles.css'; 
import './infoLabel.css';

export interface InfoLabelProps {
    text: string;
    type?: 'info' | 'warning' | 'error';
    test_id?: string;
}

export const InfoLabel: React.FC<InfoLabelProps> = ({ text, type = 'info', test_id }) => {
    return (
        <label
            className={`label-${type}`}
            data-testid={test_id}
        >
            {text}
        </label>
    );
};
