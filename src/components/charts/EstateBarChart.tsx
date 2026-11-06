"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const BAR_THICKNESS = 12;
const ROW_HEIGHT = 40;
const AXIS_HEIGHT = 30;
const AXIS_TEXT = { fill: "var(--ink2)", fontSize: 12 };

export interface EstateBarSeries<T> {
  key: keyof T & string;
  label: string;
  color: string;
}

interface EstateBarChartProps<T> {
  rows: T[];
  series: EstateBarSeries<T>[];
  formatValue: (value: number | null) => string;
}

/** Keeps identity from relying on color matching alone. */
export function ChartLegend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink2">
      {items.map(({ label, color }) => (
        <li key={label} className="flex items-center gap-1.5">
          <span aria-hidden="true" className="size-2.5 rounded-sm" style={{ backgroundColor: color }} />
          {label}
        </li>
      ))}
    </ul>
  );
}

/** Horizontal bars per estate, so long lists and estate codes fit at phone width. */
export function EstateBarChart<T extends { estate_code: string }>({
  rows,
  series,
  formatValue,
}: EstateBarChartProps<T>) {
  return (
    <ResponsiveContainer width="100%" height={rows.length * ROW_HEIGHT + AXIS_HEIGHT}>
      <BarChart
        data={rows}
        layout="vertical"
        barSize={BAR_THICKNESS}
        barGap={2}
        margin={{ top: 0, right: 8, bottom: 0, left: 0 }}
      >
        <CartesianGrid horizontal={false} stroke="var(--line)" />
        <XAxis
          type="number"
          height={AXIS_HEIGHT}
          axisLine={false}
          tickLine={false}
          tick={AXIS_TEXT}
          tickFormatter={(value: number) => `${value}m`}
        />
        <YAxis
          type="category"
          dataKey="estate_code"
          width={64}
          axisLine={{ stroke: "var(--line)" }}
          tickLine={false}
          tick={AXIS_TEXT}
        />
        <Tooltip
          cursor={{ fill: "var(--stone)" }}
          content={({ active, payload }) => {
            const row = payload?.[0]?.payload as T | undefined;
            if (!active || !row) return null;
            return (
              <div className="rounded-md border border-line bg-paper p-3 text-xs shadow-sm">
                <p className="mb-1.5 font-medium text-ink2">{row.estate_code}</p>
                <dl className="space-y-1">
                  {series.map(({ key, label, color }) => (
                    <div key={key} className="flex items-center gap-2">
                      <span aria-hidden="true" className="h-0.5 w-3" style={{ backgroundColor: color }} />
                      <dt className="text-ink2">{label}</dt>
                      <dd className="ml-auto pl-4 font-semibold text-ink tabular-nums">
                        {formatValue(row[key] as number | null)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            );
          }}
        />
        {series.map(({ key, label, color }) => (
          <Bar
            key={key}
            dataKey={key as string}
            name={label}
            fill={color}
            radius={[0, 4, 4, 0]}
            isAnimationActive={false}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
