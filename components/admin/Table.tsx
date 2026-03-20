import type { ReactNode } from "react";

export interface TableColumn<T> {
  header: string;
  className?: string;
  render: (row: T) => ReactNode;
}

export function Table<T>({
  columns,
  rows,
  rowKey,
  empty,
}: {
  columns: TableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  empty: ReactNode;
}) {
  if (rows.length === 0) {
    return empty;
  }

  return (
    <div className="overflow-hidden rounded-[20px] border border-[rgba(96,74,56,0.08)] bg-[rgba(255,255,255,0.84)] shadow-[0_12px_32px_rgba(85,63,44,0.05)]">
      <div
        className="hidden border-b border-[rgba(96,74,56,0.08)] bg-[rgba(248,239,229,0.42)] px-5 py-4 lg:grid lg:grid-cols-[repeat(var(--columns),minmax(0,1fr))] lg:gap-4"
        style={{ ["--columns" as string]: String(columns.length) }}
      >
        {columns.map((column) => (
          <div
            key={column.header}
            className={[
              "text-[11px] font-semibold tracking-[0.2em] text-[rgba(96,74,56,0.5)] uppercase",
              column.className,
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {column.header}
          </div>
        ))}
      </div>

      <div>
        {rows.map((row) => (
          <div
            key={String(rowKey(row))}
            className="border-b border-[rgba(96,74,56,0.08)] px-5 py-4 last:border-b-0"
          >
            <div
              className="grid gap-4 lg:grid-cols-[repeat(var(--columns),minmax(0,1fr))]"
              style={{ ["--columns" as string]: String(columns.length) }}
            >
              {columns.map((column) => (
                <div key={column.header} className={column.className}>
                  <div className="mb-2 text-[10px] font-semibold tracking-[0.18em] text-[rgba(96,74,56,0.4)] uppercase lg:hidden">
                    {column.header}
                  </div>
                  {column.render(row)}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
