export const ACTION_STATUSES = ["Planned", "In Progress", "Completed"] as const;

export type ActionStatus = (typeof ACTION_STATUSES)[number];

export interface ActionItem {
  id: string;
  text: string;
  quarter: string;
  status: ActionStatus;
}

/** The prototype's quarterly action plan. */
export const DEFAULT_ACTION_ITEMS: ActionItem[] = [
  {
    id: "action-1",
    text: "Source pre-purchase of legacy elevator drive spares",
    quarter: "Q3 26",
    status: "In Progress",
  },
  {
    id: "action-2",
    text: "Submit cooling tower replacement CAPEX for client approval",
    quarter: "Q3 26",
    status: "In Progress",
  },
  {
    id: "action-3",
    text: "Complete UPS battery impedance baseline across T1 assets",
    quarter: "Q3 26",
    status: "Planned",
  },
  {
    id: "action-4",
    text: "BMS points remediation — first 2 assets",
    quarter: "Q4 26",
    status: "Planned",
  },
];
