"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getSeverity } from "@/lib/attention";
import { formatSignedPercent } from "@/lib/format";
import { isNumber, type FinanceRow } from "@/lib/portfolio";
import { STATUS_LABELS } from "@/lib/status";
import { ATTENTION_LIMITS } from "@/models/constants/thresholds";
import { ChartLegend } from "./EstateBarChart";

const LIMITS = ATTENTION_LIMITS.opexVariancePct;
const WITHIN_LIMIT_COLOR = "var(--taupe)";
const OVER_LIMIT_COLOR = { warn: "var(--warn)", crit: "var(--crit)" };
const ROW_HEIGHT = 36;
const TOP_MARGIN = 18;
const TICK_STEP = 2;
const AXIS_HEIGHT = 30;
const AXIS_TEXT = { fill: "var(--ink2)", fontSize: 12 };

/** Compares each estate's variance with the attention limit. Most over plan first. */
export function OpexVarianceChart({ rows }: { rows: FinanceRow[] }) {
  const data = rows
    .filter((row) => isNumber(row.variancePct))
    .map((row) => {
      const severity = getSeverity(row.variancePct, LIMITS);
      return {
        estate_code: row.estate_code,
        variancePct: row.variancePct,
        severity,
        // Only flagged bars are labelled. The axis and tooltip cover the rest.
        flagLabel: severity ? formatSignedPercent(row.variancePct) : null,
      };
    })
    .sort((a, b) => b.variancePct - a.variancePct);

  // Even steps, always reaching zero and the limit line.
  const values = data.map((row) => row.variancePct);
  const axisMin = Math.floor(Math.min(0, ...values) / TICK_STEP) * TICK_STEP;
  const axisMax = Math.ceil(Math.max(LIMITS.warn, ...values) / TICK_STEP) * TICK_STEP;
  const ticks: number[] = [];
  for (let tick = axisMin; tick <= axisMax; tick += TICK_STEP) ticks.push(tick);

  return (
    <div className="space-y-3">
      <ChartLegend
        items={[
          { label: "Within limit", color: WITHIN_LIMIT_COLOR },
          { label: `Over ${LIMITS.warn}% limit`, color: OVER_LIMIT_COLOR.warn },
        ]}
      />
      <ResponsiveContainer width="100%" height={data.length * ROW_HEIGHT + AXIS_HEIGHT + TOP_MARGIN}>
        <BarChart
          data={data}
          layout="vertical"
          barSize={14}
          margin={{ top: TOP_MARGIN, right: 52, bottom: 0, left: 0 }}
        >
          <CartesianGrid horizontal={false} stroke="var(--line)" />
          <XAxis
            type="number"
            height={AXIS_HEIGHT}
            domain={[axisMin, axisMax]}
            ticks={ticks}
            axisLine={false}
            tickLine={false}
            tick={AXIS_TEXT}
            tickFormatter={(value: number) => `${value}%`}
          />
          <YAxis
            type="category"
            dataKey="estate_code"
            width={64}
            axisLine={false}
            tickLine={false}
            tick={AXIS_TEXT}
          />
          <Tooltip
            cursor={{ fill: "var(--stone)" }}
            content={({ active, payload }) => {
              const row = payload?.[0]?.payload as (typeof data)[number] | undefined;
              if (!active || !row) return null;
              return (
                <div className="rounded-md border border-line bg-paper p-3 text-xs shadow-sm">
                  <p className="mb-1 font-medium text-ink2">{row.estate_code}</p>
                  <p className="font-semibold text-ink tabular-nums">
                    {formatSignedPercent(row.variancePct)} vs plan
                  </p>
                  {row.severity && <p className="mt-1 text-ink2">{STATUS_LABELS[row.severity]}: over limit</p>}
                </div>
              );
            }}
          />
          <ReferenceLine x={0} stroke="var(--ink2)" />
          <ReferenceLine
            x={LIMITS.warn}
            stroke="var(--warn)"
            label={{ value: `${LIMITS.warn}% limit`, position: "top", fill: "var(--ink2)", fontSize: 11 }}
          />
          <Bar dataKey="variancePct" radius={2} isAnimationActive={false}>
            {data.map((row) => (
              <Cell
                key={row.estate_code}
                fill={row.severity ? OVER_LIMIT_COLOR[row.severity] : WITHIN_LIMIT_COLOR}
              />
            ))}
            <LabelList dataKey="flagLabel" position="right" fill="var(--ink)" fontSize={12} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
