"use client"

import { BarChart as TremorBarChart } from "@tremor/react"
import { LineChart as TremorLineChart } from "@tremor/react"
import { DonutChart } from "@tremor/react"

interface ChartProps {
  data: any[]
  index: string
  categories: string[]
  colors: string[]
  valueFormatter?: (value: number) => string
  layout?: "vertical" | "horizontal"
}

interface PieChartProps {
  data: any[]
  index: string
  category: string
  colors: string[]
}

export function BarChart({ data, index, categories, colors, valueFormatter, layout = "horizontal" }: ChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <p className="text-muted-foreground">No data available</p>
      </div>
    )
  }

  return (
    <TremorBarChart
      className="h-full"
      data={data}
      index={index}
      categories={categories}
      colors={colors}
      valueFormatter={valueFormatter}
      layout={layout}
      showLegend={false}
      showGridLines={false}
      showAnimation={true}
    />
  )
}

export function LineChart({ data, index, categories, colors, valueFormatter }: ChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <p className="text-muted-foreground">No data available</p>
      </div>
    )
  }

  return (
    <TremorLineChart
      className="h-full"
      data={data}
      index={index}
      categories={categories}
      colors={colors}
      valueFormatter={valueFormatter}
      showLegend={false}
      showGridLines={false}
      showAnimation={true}
      curveType="monotone"
    />
  )
}

export function PieChart({ data, index, category, colors }: PieChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <p className="text-muted-foreground">No data available</p>
      </div>
    )
  }

  return (
    <DonutChart
      className="h-full"
      data={data}
      index={index}
      category={category}
      colors={colors}
      variant="pie"
      showAnimation={true}
      valueFormatter={(value) => `${value}`}
    />
  )
}
