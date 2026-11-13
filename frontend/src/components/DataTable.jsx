import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Loader from './Loader';

// Generic table: pass `columns` ([{ key, label, render? }]) and `rows`.
// Handles its own pagination footer when `pagination` + `onPageChange` are provided.
const DataTable = ({ columns, rows, loading, emptyMessage = 'No records found', pagination, onPageChange, onRowClick }) => {
  const visibleColumns = columns.filter((col) => col.label);
  const actionColumn = columns.find((col) => !col.label);

  const renderCell = (col, row) => col.render ? col.render(row) : row[col.key];

  return (
    <div className="card overflow-hidden p-0">
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-5 py-3 font-medium">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading && (
              <tr>
                <td colSpan={columns.length} className="px-5 py-10 text-center">
                  <Loader />
                </td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-5 py-10 text-center text-slate-400">
                  {emptyMessage}
                </td>
              </tr>
            )}
            {!loading &&
              rows.map((row) => (
                <tr
                  key={row._id || row.id}
                  className={`${onRowClick ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50' : ''}`}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-5 py-3 text-slate-700 dark:text-slate-200">
                      {renderCell(col, row)}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-slate-100 lg:hidden dark:divide-slate-800">
        {loading && (
          <div className="px-4 py-10 text-center">
            <Loader />
          </div>
        )}
        {!loading && rows.length === 0 && (
          <div className="px-4 py-10 text-center text-sm text-slate-400">{emptyMessage}</div>
        )}
        {!loading &&
          rows.map((row) => (
            <div
              key={row._id || row.id}
              className={`${onRowClick ? 'cursor-pointer active:bg-slate-50 dark:active:bg-slate-800/50' : ''} p-4`}
              onClick={() => onRowClick && onRowClick(row)}
            >
              <div className="space-y-3">
                {visibleColumns.map((col, index) => (
                  <div
                    key={col.key}
                    className={index === 0 ? 'text-sm' : 'grid grid-cols-[7rem_1fr] gap-3 text-sm'}
                  >
                    {index === 0 ? (
                      <div className="min-w-0 text-slate-800 dark:text-slate-100">{renderCell(col, row)}</div>
                    ) : (
                      <>
                        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{col.label}</span>
                        <div className="min-w-0 text-slate-700 dark:text-slate-200">{renderCell(col, row)}</div>
                      </>
                    )}
                  </div>
                ))}
                {actionColumn && (
                  <div className="pt-1" onClick={(e) => e.stopPropagation()}>
                    {renderCell(actionColumn, row)}
                  </div>
                )}
              </div>
            </div>
          ))}
      </div>

      {pagination && pagination.pages > 1 && (
        <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-5 dark:border-slate-800">
          <span className="text-slate-500">
            Page {pagination.page} of {pagination.pages} &middot; {pagination.total} total
          </span>
          <div className="flex gap-2">
            <button
              className="btn-secondary px-2 py-1"
              disabled={pagination.page <= 1}
              onClick={() => onPageChange(pagination.page - 1)}
            >
              <FiChevronLeft />
            </button>
            <button
              className="btn-secondary px-2 py-1"
              disabled={pagination.page >= pagination.pages}
              onClick={() => onPageChange(pagination.page + 1)}
            >
              <FiChevronRight />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
