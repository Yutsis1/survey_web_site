import React from 'react';
import '../../styles.css'; 
import './infoLabel.css';

export interface InfoLabelProps {
    text: string;
    type?: 'info' | 'warning' | 'error';
}

export const InfoLabel: React.FC<InfoLabelProps> = ({ text, type = 'info' }) => {
    return (
        <label
            className={`label-${type}`}
        >
            {text}
        </label>
    );
};
