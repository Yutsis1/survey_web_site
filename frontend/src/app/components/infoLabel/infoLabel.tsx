import React from 'react';
import '../../styles.css'; 
import './infoLabel.css';

export interface InfoLabelProps {
    text: string;
    type?: 'info' | 'warning' | 'error';
    test_id?: string;
    name?: string;
}

export const InfoLabel: React.FC<InfoLabelProps> = ({ text, type = 'info', test_id, name }) => {
    return (
        <label
            className={`label-${type}`}
            data-testid={test_id}
            htmlFor={name}
        >
            {text}
        </label>
    );
};
