"use client";

import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { DATA_DICTIONARY, type DictionaryEndpoint } from "@/models/constants/dataDictionary";

const COLUMNS: DataTableColumn<DictionaryEndpoint>[] = [
  { key: "name", header: "Dataset", value: (row) => row.name },
  {
    key: "route",
    header: "Endpoint",
    value: (row) => row.route,
    render: (row) => <code className="font-mono text-xs">GET {row.route}</code>,
  },
  { key: "roles", header: "Allowed roles", value: (row) => row.roles ?? "Not in the guide" },
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
      <p className="mb-2 text-xs text-ink2">
        For one estate:{" "}
        <code className="font-mono">
          GET {endpoint.route}?$filter=estate_code eq &apos;{"{estate_code}"}&apos;
        </code>
      </p>
      <table className="w-full min-w-[46rem] border-collapse text-left text-xs">
        <caption className="sr-only">Fields in {endpoint.name}</caption>
        <thead>
          <tr className="border-b border-line text-ink2">
            {["Field", "Type", "Definition", "Source", "Refresh", "Sensitivity", "Status"].map((heading) => (
              <th key={heading} scope="col" className="py-1.5 pr-4 font-semibold whitespace-nowrap">
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
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
