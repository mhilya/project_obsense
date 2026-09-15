import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Search, SlidersHorizontal, X } from 'lucide-react';

export const DataTable = ({
  columns,
  data,
  searchPlaceholder = 'Cari data...',
  searchKeys = [],
  filterOptions = null,
  filterKey = null,
  filterLabel = 'Semua Kategori',
  loading = false,
  emptyMessage = 'Tidak ada data yang cocok ditemukan.',
  defaultPageSize = 10,
  rowActions = null
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  // 1. Filtering & Searching
  const filteredData = useMemo(() => {
    let result = [...data];

    // Filter Dropdown
    if (filterKey && selectedFilter) {
      result = result.filter((item) => {
        const val = item[filterKey];
        return String(val).toLowerCase() === selectedFilter.toLowerCase();
      });
    }

    // Search input
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter((item) => {
        if (searchKeys.length > 0) {
          return searchKeys.some((k) => String(item[k] ?? '').toLowerCase().includes(q));
        }
        return Object.values(item).some((val) =>
          String(val ?? '').toLowerCase().includes(q)
        );
      });
    }

    // Sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];

        if (aVal === bVal) return 0;
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;

        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
        }

        const aStr = String(aVal).toLowerCase();
        const bStr = String(bVal).toLowerCase();
        if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, searchTerm, searchKeys, filterKey, selectedFilter, sortConfig]);

  // 2. Pagination calculation
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === 'asc' ? 'desc' : 'asc'
        };
      }
      return { key, direction: 'asc' };
    });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden dark:border-slate-800 dark:bg-slate-900 transition-colors">
      {/* Controls: Search, Filter, Page Size */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4 dark:border-slate-800">
        <div className="relative flex flex-1 min-w-[240px] max-w-sm items-center">
          <Search size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
          <input
            type="text"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-8 py-2 text-xs font-medium text-slate-900 placeholder-slate-400 outline-none transition focus:border-blue-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-800"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
          {searchTerm && (
            <button
              className="absolute right-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              onClick={() => {
                setSearchTerm('');
                setCurrentPage(1);
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {filterOptions && (
            <div className="relative flex items-center">
              <SlidersHorizontal size={14} className="absolute left-3 text-slate-400 pointer-events-none" />
              <select
                className="rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-6 py-2 text-xs font-medium text-slate-700 outline-none transition hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
                value={selectedFilter}
                onChange={(e) => {
                  setSelectedFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">{filterLabel}</option>
                {filterOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Tampil:</span>
            <select
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key || col.header}
                  style={{ width: col.width }}
                  className={`border-b border-slate-100 bg-slate-50/80 px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400 ${
                    col.sortable !== false ? 'cursor-pointer select-none hover:bg-slate-100 dark:hover:bg-slate-800' : ''
                  }`}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.header}</span>
                    {col.sortable !== false && (
                      <span className="text-slate-400">
                        {sortConfig.key === col.key ? (
                          sortConfig.direction === 'asc' ? (
                            <ChevronUp size={13} className="text-blue-600 dark:text-blue-400" />
                          ) : (
                            <ChevronDown size={13} className="text-blue-600 dark:text-blue-400" />
                          )
                        ) : (
                          <span className="text-[10px]">↕</span>
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {rowActions && (
                <th className="border-b border-slate-100 bg-slate-50/80 px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-right dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                  Aksi
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {loading ? (
              <tr>
                <td colSpan={columns.length + (rowActions ? 1 : 0)} className="py-12 text-center text-slate-400">
                  <div className="space-y-2 max-w-sm mx-auto">
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded animate-pulse w-5/6 mx-auto"></div>
                  </div>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (rowActions ? 1 : 0)} className="py-12 text-center text-slate-400 text-xs">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => (
                <tr key={row.id || idx} className="hover:bg-blue-50/30 dark:hover:bg-slate-800/40 transition-colors">
                  {columns.map((col) => (
                    <td key={col.key || col.header} className="px-4 py-3.5 align-middle text-slate-700 dark:text-slate-300">
                      {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '-')}
                    </td>
                  ))}
                  {rowActions && (
                    <td className="px-4 py-3.5 align-middle text-right">
                      {rowActions(row)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 p-4 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
        <div>
          Menampilkan <strong className="text-slate-800 dark:text-slate-200">{totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1}</strong> sampai{' '}
          <strong className="text-slate-800 dark:text-slate-200">{Math.min(currentPage * pageSize, totalItems)}</strong> dari{' '}
          <strong className="text-slate-800 dark:text-slate-200">{totalItems}</strong> data
        </div>

        <div className="flex items-center gap-2">
          <button
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            disabled={currentPage === 1 || loading}
            onClick={() => handlePageChange(currentPage - 1)}
            title="Halaman Sebelumnya"
          >
            <ChevronLeft size={15} />
          </button>
          <span className="px-2 font-semibold text-slate-700 dark:text-slate-200">
            Hal {currentPage} / {totalPages}
          </span>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            disabled={currentPage === totalPages || loading}
            onClick={() => handlePageChange(currentPage + 1)}
            title="Halaman Berikutnya"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataTable;

