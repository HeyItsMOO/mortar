import type { ConfigEntry, ConfigValue } from './types.ts'

const NUMBER_WIDTH_PX = 120
const TEXT_WIDTH_PX = 280

interface WidgetProps {
  entry: ConfigEntry
  label: string
  onChange: (value: ConfigValue) => void
}

export type { WidgetProps }
export { NUMBER_WIDTH_PX, TEXT_WIDTH_PX }
