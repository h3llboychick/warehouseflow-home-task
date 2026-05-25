import { memo } from "react";

function DataTable({ columns, rows, emptyMessage = "No rows found." }) {
  if (!rows.length) {
    return <p className="empty-state">{emptyMessage}</p>;
  }

  return (
    <table className="data-table">
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.key}>{column.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr key={row.id ?? row.code ?? row.shipment_number ?? `${index}`}>
            {columns.map((column) => (
              <td key={column.key}>{column.render ? column.render(row) : row[column.key]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default memo(DataTable);
