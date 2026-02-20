'use client'

import React, { useState } from 'react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

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
    const [internalSelectedValue, setInternalSelectedValue] = useState<
        string | undefined
    >(undefined)
    const currentSelectedValue = selectedValue ?? internalSelectedValue

    const handleChange = (value: string) => {
        setInternalSelectedValue(value)
        onChange?.(value)
    }

    return (
        <RadioGroup
            value={currentSelectedValue}
            onValueChange={handleChange}
            className="flex flex-col gap-3"
            data-testid={test_id}
        >
            {buttons.map((button, index) => {
                const itemId = `${name || 'radio'}-${button.value}-${index}`
                return (
                    <div key={index} className="flex items-center gap-2">
                        <RadioGroupItem value={button.value} id={itemId} />
                        <Label htmlFor={itemId} className="text-sm text-foreground cursor-pointer">
                            {button.label}
                        </Label>
                    </div>
                )
            })}
        </RadioGroup>
    )
}

export { RadioBar }
