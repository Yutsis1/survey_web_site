"use client"

import * as React from "react"
import {
  Tooltip as RechartsTooltip,
  TooltipProps as RechartsTooltipProps,
} from "recharts"

import { cn } from "@/lib/utils"

export type ChartConfig = Record<
  string,
  {
    label?: string
    color?: string
  }
>

const ChartConfigContext = React.createContext<ChartConfig>({})

function useChartConfig() {
  return React.useContext(ChartConfigContext)
}

function ChartContainer({
  config,
  className,
  children,
}: {
  config: ChartConfig
  className?: string
  children: React.ReactNode
}) {
  return (
    <ChartConfigContext.Provider value={config}>
      <div className={cn("w-full h-[260px]", className)}>{children}</div>
    </ChartConfigContext.Provider>
  )
}

function ChartTooltip(props: RechartsTooltipProps<number, string>) {
  return <RechartsTooltip cursor={{ stroke: "hsl(var(--border))" }} {...props} />
}

function ChartTooltipContent({
  active,
  payload,
  label,
  className,
}: {
  active?: boolean
  payload?: Array<{ name: string; value: number; color?: string }>
  label?: string
  className?: string
}) {
  const config = useChartConfig()
  if (!active || !payload?.length) return null

  return (
    <div className={cn("rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-lg", className)}>
      {label && <div className="mb-2 font-medium text-foreground">{label}</div>}
      <div className="space-y-1">
        {payload.map((item) => {
          const key = item.name
          const cfg = config[key]
          const name = cfg?.label ?? key
          const color = item.color ?? cfg?.color ?? "hsl(var(--primary))"

          return (
            <div key={key} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                <span>{name}</span>
              </div>
              <span className="text-foreground">{item.value}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export { ChartContainer, ChartTooltip, ChartTooltipContent, useChartConfig }
