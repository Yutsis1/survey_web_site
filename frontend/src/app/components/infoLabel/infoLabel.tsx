import React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, Info, AlertTriangle } from 'lucide-react';

export interface InfoLabelProps {
    text: string;
    type?: 'info' | 'warning' | 'error';
    test_id?: string;
    name?: string;
}

const typeStyles = {
    info: 'border-primary/30 bg-primary/10 text-primary',
    warning: 'border-warning/30 bg-warning/10 text-warning',
    error: 'border-destructive/30 bg-destructive/10 text-destructive',
};

const typeIcons = {
    info: Info,
    warning: AlertTriangle,
    error: AlertCircle,
};

export const InfoLabel: React.FC<InfoLabelProps> = ({ text, type = 'info', test_id, name }) => {
    const Icon = typeIcons[type];

    return (
        <div
            className={cn(
                'flex items-center gap-2 rounded-md border px-3 py-2 text-sm',
                typeStyles[type]
            )}
            data-testid={test_id}
            role="alert"
            aria-label={name}
        >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{text}</span>
        </div>
    );
};
