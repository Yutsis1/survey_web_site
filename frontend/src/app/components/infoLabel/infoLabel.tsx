import React from 'react';
import { AlertCircle, Info, TriangleAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface InfoLabelProps {
    text: string;
    type?: 'info' | 'warning' | 'error';
    test_id?: string;
    name?: string;
}

export const InfoLabel: React.FC<InfoLabelProps> = ({ text, type = 'info', test_id, name }) => {
    const icon =
        type === 'error' ? <AlertCircle className="h-3.5 w-3.5" /> :
            type === 'warning' ? <TriangleAlert className="h-3.5 w-3.5" /> :
                <Info className="h-3.5 w-3.5" />

    return (
        <label
            className={cn(
                `label-${type}`,
                "inline-flex items-start gap-2 rounded-md border px-3 py-2 text-sm",
                type === 'info' && "border-border bg-secondary/30 text-muted-foreground",
                type === 'warning' && "border-warning/40 bg-warning/10 text-warning",
                type === 'error' && "border-destructive/40 bg-destructive/10 text-destructive"
            )}
            data-testid={test_id}
            htmlFor={name}
        >
            {icon}
            {text}
        </label>
    );
};
