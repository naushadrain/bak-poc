"use client";

import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { DATA_DICTIONARY, type DictionaryEndpoint } from "@/models/constants/dataDictionary";

const COLUMNS: DataTableColumn<DictionaryEndpoint>[] = [
  { key: "name", header: "Dataset", value: (row) => row.name },
  {
    key: "route",
    header: "Endpoint",
    value: (row) => row.route ?? "Route to be confirmed",
    render: (row) =>
      row.route ? (
        <code className="font-mono text-xs">GET {row.route}</code>
      ) : (
        <span className="text-ink2">Route to be confirmed</span>
      ),
  },
  { key: "view", header: "Source view", value: (row) => row.view },
  {
    key: "fields",
    header: "Fields",
    // Searching by field name finds the dataset, while the cell just shows the count.
    value: (row) => row.fields.map((field) => field.name).join(" "),
    render: (row) => row.fields.length,
    align: "right",
  },
];

function FieldTable({ endpoint }: { endpoint: DictionaryEndpoint }) {
  return (
    <div>
      {endpoint.route && (
        <p className="mb-2 text-xs text-ink2">
          For one estate: <code className="font-mono">GET {endpoint.route}/{"{estate_code}"}</code>
        </p>
      )}
      <table className="w-full min-w-[46rem] border-collapse text-left text-xs">
        <caption className="sr-only">Fields in {endpoint.name}</caption>
        <thead>
          <tr className="border-b border-ink/10 text-ink2">
            {["Field", "Type", "Definition", "Source", "Refresh", "Sensitivity", "Status"].map((heading) => (
              <th key={heading} scope="col" className="py-1.5 pr-4 font-semibold whitespace-nowrap">
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/10">
          {endpoint.fields.map((field) => (
            <tr key={field.name} className="align-top text-ink">
              <td className="py-1.5 pr-4 font-mono whitespace-nowrap">{field.name}</td>
              <td className="py-1.5 pr-4 font-mono whitespace-nowrap text-ink2">{field.type}</td>
              <td className="py-1.5 pr-4 whitespace-normal">{field.definition}</td>
              <td className="py-1.5 pr-4 whitespace-nowrap text-ink2">{field.source ?? "—"}</td>
              <td className="py-1.5 pr-4 whitespace-nowrap text-ink2">{field.refresh ?? "—"}</td>
              <td className="py-1.5 pr-4 whitespace-nowrap text-ink2">{field.sensitivity ?? "—"}</td>
              <td className="py-1.5 whitespace-nowrap text-ink2">{field.status ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DataDictionary() {
  return (
    <DataTable
      label="Data dictionary"
      columns={COLUMNS}
      rows={DATA_DICTIONARY}
      getRowKey={(row) => row.interfaceName}
      searchPlaceholder="Search datasets or fields"
      scrollClassName="max-h-[40rem]"
      renderExpanded={(row) => <FieldTable endpoint={row} />}
    />
  );
}
