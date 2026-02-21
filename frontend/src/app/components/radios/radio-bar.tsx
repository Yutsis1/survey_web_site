'use client'

import React, { useState } from 'react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface RadioProps {
    label: string
    value: string
}

export interface RadioBarProps {
    buttons: RadioProps[]
    name?: string
    onChange?: (value: string) => void
    selectedValue?: string
    test_id?: string
}

const RadioBar: React.FC<RadioBarProps> = ({
    buttons,
    name,
    test_id,
    onChange,
    selectedValue,
}) => {
    const [internalSelectedValue, setInternalSelectedValue] = useState('')
    const currentSelectedValue = selectedValue ?? internalSelectedValue

    const handleChange = (value: string) => {
        setInternalSelectedValue(value)
        onChange?.(value)
    }

    return (
        <RadioGroup
            data-testid={test_id}
            value={currentSelectedValue}
            onValueChange={handleChange}
            name={name}
            className="grid gap-2"
        >
            {buttons.map((button, index) => (
                <div
                    key={index}
                    className={cn(
                        "flex items-center gap-2 rounded-md border border-border bg-secondary/35 px-3 py-2",
                        currentSelectedValue === button.value && "border-primary/60 bg-primary/10"
                    )}
                >
                    <RadioGroupItem
                        id={`${name ?? 'radio'}-${index}`}
                        value={button.value}
                    />
                    <Label htmlFor={`${name ?? 'radio'}-${index}`}>
                        {button.label}
                    </Label>
                </div>
            ))}
        </RadioGroup>
    )
}

export { RadioBar }
