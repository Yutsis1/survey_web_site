import React from 'react';
import '../../styles.css'; 

interface InfoLabelProps {
    text: string;
}

const InfoLabel: React.FC<InfoLabelProps> = ({ text }) => {
    return (
        <label
            style={{
                color: 'var(--foreground)',
                backgroundColor: 'var(--background)',
                padding: '10px',
                borderRadius: '4px',
                fontSize: '18px',
                transition: 'all 0.2s ease',
            }}
        >
            {text}
        </label>
    );
};

export default InfoLabel;