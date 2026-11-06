const oneDecimal = new Intl.NumberFormat("en-GB", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const upToOneDecimal = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 1 });
const upToTwoDecimals = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 2 });
const signedPercent = new Intl.NumberFormat("en-GB", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  signDisplay: "exceptZero",
});

export function formatAedMillions(aed: number) {
  return `AED ${oneDecimal.format(aed / 1_000_000)}m`;
}

export function formatPercent(value: number) {
  return `${upToTwoDecimals.format(value)}%`;
}

export function formatSignedPercent(value: number) {
  return `${signedPercent.format(value)}%`;
}

export function formatScore(value: number) {
  return upToOneDecimal.format(value);
}

export function formatCount(value: number) {
  return upToOneDecimal.format(value);
}
