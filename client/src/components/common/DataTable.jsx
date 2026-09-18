import React from 'react';
import { Loader } from './Loader';
import { EmptyState } from './EmptyState';
import { Pagination } from './Pagination';

export const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = 'No records found',
  pagination,
  onRowClick,
  rowClassName = '',
}) => {
  if (loading && (!data || data.length === 0)) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-subtle">
        <Loader text="Loading data..." />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((col, index) => (
                <th
                  key={index}
                  scope="col"
                  className={`px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider ${
                    col.className || ''
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {data && data.length > 0 ? (
              data.map((row, rowIndex) => (
                <tr
                  key={row._id || rowIndex}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`transition-colors duration-150 ${
                    onRowClick ? 'cursor-pointer hover:bg-slate-50/80' : 'hover:bg-slate-50/40'
                  } ${typeof rowClassName === 'function' ? rowClassName(row) : rowClassName}`}
                >
                  {columns.map((col, colIndex) => (
                    <td
                      key={colIndex}
                      className={`px-6 py-4 whitespace-nowrap text-sm text-slate-700 ${
                        col.cellClassName || ''
                      }`}
                    >
                      {col.render ? col.render(row, rowIndex) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <EmptyState description={emptyMessage} />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={pagination.onPageChange}
        />
      )}
    </div>
  );
};

export default DataTable;
