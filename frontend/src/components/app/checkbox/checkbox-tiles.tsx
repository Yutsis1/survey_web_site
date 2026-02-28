'use client'

import React, { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'

interface CheckboxTileOption {
  label: string
  value: string
}

export interface CheckboxTilesProps {
  buttons: CheckboxTileOption[]
  name?: string
  onChange?: (values: string[]) => void
  selectedValues?: string[]
  test_id?: string
}

const CheckboxTiles: React.FC<CheckboxTilesProps> = ({
  buttons,
  name,
  onChange,
  selectedValues,
  test_id,
}) => {
  const [internalSelectedValues, setInternalSelectedValues] = useState<string[]>([])
  const currentSelectedValues = selectedValues ?? internalSelectedValues
  const selectedSet = useMemo(() => new Set(currentSelectedValues), [currentSelectedValues])

  const handleToggle = (value: string) => {
    const next = selectedSet.has(value)
      ? currentSelectedValues.filter((item) => item !== value)
      : [...currentSelectedValues, value]

    setInternalSelectedValues(next)
    onChange?.(next)
  }

  return (
    <div data-testid={test_id} className="grid gap-2">
      {buttons.map((button, index) => {
        const checked = selectedSet.has(button.value)
        const id = `${name ?? 'checkbox-tiles'}-${index}`

        return (
          <label
            key={`${button.value}-${index}`}
            className={cn(
              'flex cursor-pointer items-center gap-2 rounded-md border border-border bg-secondary/35 px-3 py-2',
              checked && 'border-primary/60 bg-primary/10'
            )}
          >
            <input
              id={id}
              type="checkbox"
              name={name}
              value={button.value}
              checked={checked}
              onChange={() => handleToggle(button.value)}
              className="h-4 w-4 accent-primary"
            />
            <span className="text-sm text-foreground">{button.label}</span>
          </label>
        )
      })}
    </div>
  )
}

export { CheckboxTiles }
