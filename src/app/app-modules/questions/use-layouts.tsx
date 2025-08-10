import { useState } from 'react'
import type { Layouts, Layout } from 'react-grid-layout'

const BASE: Layouts = {
  lg: [{ i: 'default-question', x: 0, y: 0, w: 2, h: 2 }],
  md: [{ i: 'default-question', x: 0, y: 0, w: 2, h: 2 }],
  sm: [{ i: 'default-question', x: 0, y: 0, w: 2, h: 2 }],
  xs: [{ i: 'default-question', x: 0, y: 0, w: 2, h: 2 }],
  xxs: [{ i: 'default-question', x: 0, y: 0, w: 2, h: 2 }],
}

export function useLayouts() {
  const [layouts, setLayouts] = useState<Layouts>(BASE)

  const append = (layout: Layout) =>
    setLayouts(prev => ({
      lg: [...(prev.lg || []), layout],
      md: [...(prev.md || []), layout],
      sm: [...(prev.sm || []), layout],
      xs: [...(prev.xs || []), layout],
      xxs: [...(prev.xxs || []), layout],
    }))

  const reset = () => setLayouts(BASE)

  return { layouts, setLayouts, append, reset }
}
