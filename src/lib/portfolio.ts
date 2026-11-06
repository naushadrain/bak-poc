import type { AssetMgmt, Finance } from "@/models/interfaces";

const PORTFOLIO_CODE = "PORTFOLIO";

interface EstateRow {
  estate_code: string;
}

/** The sample data has a roll-up row alongside the estates. Keep it out of estate lists. */
export function splitPortfolio<T extends EstateRow>(rows: T[] | null) {
  const all = rows ?? [];
  return {
    portfolio: all.find((row) => row.estate_code === PORTFOLIO_CODE) ?? null,
    estates: all.filter((row) => row.estate_code !== PORTFOLIO_CODE),
  };
}

/**
 * Matches on the code rather than taking the first row, so an API that ignores
 * the estate parameter can't put another estate's numbers on this estate's page.
 */
export function findEstateRow<T extends EstateRow>(rows: T[] | null, estate_code: string) {
  const code = estate_code.toLowerCase();
  return rows?.find((row) => row.estate_code?.toLowerCase() === code) ?? null;
}

export function isNumber(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function mean(values: (number | null | undefined)[]) {
  const numbers = values.filter(isNumber);
  if (numbers.length === 0) return null;
  return numbers.reduce((total, value) => total + value, 0) / numbers.length;
}

/**
 * The API has no plan field, but opex_var_pct is (actual - plan) / plan over the
 * same period as opex_ytd_aed, so the plan can be recovered from the two.
 */
export function getOpexPlan({ opex_ytd_aed, opex_var_pct }: Finance) {
  if (!isNumber(opex_ytd_aed) || !isNumber(opex_var_pct)) return null;
  const ratio = 1 + opex_var_pct / 100;
  return ratio > 0 ? opex_ytd_aed / ratio : null;
}

export function sumOf<T>(rows: T[], pick: (row: T) => number | null) {
  const values = rows.map(pick).filter(isNumber);
  return values.length > 0 ? values.reduce((total, value) => total + value, 0) : null;
}

export interface FinanceRow {
  estate_code: string;
  actualM: number;
  planM: number | null;
  variancePct: number;
  capexM: number | null;
}

/** Estate rows in AED millions, largest spend first. */
export function getFinanceRows(rows: Finance[] | null): FinanceRow[] {
  return splitPortfolio(rows)
    .estates.filter((row) => isNumber(row.opex_ytd_aed))
    .map((row) => {
      const plan = getOpexPlan(row);
      return {
        estate_code: row.estate_code,
        actualM: row.opex_ytd_aed / 1_000_000,
        planM: plan === null ? null : plan / 1_000_000,
        variancePct: row.opex_var_pct,
        capexM: isNumber(row.capex_committed_aed) ? row.capex_committed_aed / 1_000_000 : null,
      };
    })
    .sort((a, b) => b.actualM - a.actualM);
}

/** Summing estates matches the portfolio total in the sample data. */
export function getPortfolioOpex(rows: Finance[] | null) {
  const { portfolio, estates } = splitPortfolio(rows);
  if (portfolio) {
    return { total: portfolio.opex_ytd_aed, variancePct: portfolio.opex_var_pct };
  }
  if (estates.length === 0) return { total: null, variancePct: null };

  const total = estates.reduce((sum, row) => sum + (row.opex_ytd_aed ?? 0), 0);
  const plans = estates.map(getOpexPlan);
  const plan = plans.every(isNumber) ? plans.reduce((sum, value) => sum + value, 0) : 0;
  return { total, variancePct: plan > 0 ? (total / plan - 1) * 100 : null };
}

/** A plain mean of estates matches the portfolio index in the sample data. */
export function getPortfolioHealth(rows: AssetMgmt[] | null) {
  const { portfolio, estates } = splitPortfolio(rows);
  return portfolio?.asset_health_idx ?? mean(estates.map((row) => row.asset_health_idx));
}
