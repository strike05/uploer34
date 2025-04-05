"use client"

import {
  LineChart,
  BarChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart as RechartsAreaChart,
  Area,
} from "recharts"

// Farbpalette für Diagramme
const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"]

interface ChartProps {
  data: any[]
  index: string
  categories: string[]
  colors?: string[]
  valueFormatter?: (value: number) => string
  className?: string
}

export function LineChart2({ data, index, categories, colors = COLORS, valueFormatter, className }: ChartProps) {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: 10,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey={index}
            className="text-xs fill-muted-foreground"
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: "hsl(var(--muted))" }}
            axisLine={{ stroke: "hsl(var(--muted))" }}
          />
          <YAxis
            className="text-xs fill-muted-foreground"
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: "hsl(var(--muted))" }}
            axisLine={{ stroke: "hsl(var(--muted))" }}
            tickFormatter={valueFormatter}
          />
          <Tooltip
            formatter={valueFormatter}
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              borderColor: "hsl(var(--border))",
              borderRadius: "var(--radius)",
              fontSize: "12px",
              color: "hsl(var(--foreground))",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "12px" }} />
          {categories.map((category, i) => (
            <Line
              key={category}
              type="monotone"
              dataKey={category}
              stroke={`hsl(${colors[i % colors.length]})`}
              strokeWidth={2}
              dot={{ r: 4, fill: `hsl(${colors[i % colors.length]})` }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function BarChart3({ data, index, categories, colors = COLORS, valueFormatter, className }: ChartProps) {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: 10,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey={index}
            className="text-xs fill-muted-foreground"
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: "hsl(var(--muted))" }}
            axisLine={{ stroke: "hsl(var(--muted))" }}
          />
          <YAxis
            className="text-xs fill-muted-foreground"
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: "hsl(var(--muted))" }}
            axisLine={{ stroke: "hsl(var(--muted))" }}
            tickFormatter={valueFormatter}
          />
          <Tooltip
            formatter={valueFormatter}
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              borderColor: "hsl(var(--border))",
              borderRadius: "var(--radius)",
              fontSize: "12px",
              color: "hsl(var(--foreground))",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "12px" }} />
          {categories.map((category, i) => (
            <Bar key={category} dataKey={category} fill={`hsl(${colors[i % colors.length]})`} radius={[4, 4, 0, 0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function PieChart2({ data, index, categories, colors = COLORS, valueFormatter, className }: ChartProps) {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            dataKey={categories[0]}
            nameKey={index}
            label={({ name, percent }) =>
              `${name}: ${valueFormatter ? valueFormatter(percent * 100) : `${(percent * 100).toFixed(0)}%`}`
            }
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={`hsl(${colors[index % colors.length]})`} />
            ))}
          </Pie>
          <Tooltip
            formatter={valueFormatter}
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              borderColor: "hsl(var(--border))",
              borderRadius: "var(--radius)",
              fontSize: "12px",
              color: "hsl(var(--foreground))",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "12px" }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export function AreaChart({ data, index, categories, colors = COLORS, valueFormatter, className }: ChartProps) {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: 10,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey={index}
            className="text-xs fill-muted-foreground"
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: "hsl(var(--muted))" }}
            axisLine={{ stroke: "hsl(var(--muted))" }}
          />
          <YAxis
            className="text-xs fill-muted-foreground"
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: "hsl(var(--muted))" }}
            axisLine={{ stroke: "hsl(var(--muted))" }}
            tickFormatter={valueFormatter}
          />
          <Tooltip
            formatter={valueFormatter}
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              borderColor: "hsl(var(--border))",
              borderRadius: "var(--radius)",
              fontSize: "12px",
              color: "hsl(var(--foreground))",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "12px" }} />
          {categories.map((category, i) => (
            <Area
              key={category}
              type="monotone"
              dataKey={category}
              fill={`hsl(${colors[i % colors.length] + "/ 0.3"})`}
              stroke={`hsl(${colors[i % colors.length]})`}
              fillOpacity={0.3}
              strokeWidth={2}
            />
          ))}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  )
}

