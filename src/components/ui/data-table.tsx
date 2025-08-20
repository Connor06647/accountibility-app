import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Search, Filter, MoreVertical, Download, Trash2, Edit } from 'lucide-react';
import { ButtonEnhanced } from './button-enhanced';

export interface TableColumn<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, row: T, index: number) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
  headerClassName?: string;
  cellClassName?: string;
}

export interface TableAction<T = any> {
  label: string;
  icon?: React.ComponentType<any>;
  onClick: (row: T, index: number) => void;
  variant?: 'default' | 'danger' | 'warning';
  disabled?: (row: T) => boolean;
}

interface DataTableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  actions?: TableAction<T>[];
  loading?: boolean;
  searchable?: boolean;
  filterable?: boolean;
  sortable?: boolean;
  pagination?: {
    enabled: boolean;
    pageSize?: number;
    showSizeSelector?: boolean;
  };
  selection?: {
    enabled: boolean;
    onSelectionChange?: (selectedItems: T[]) => void;
  };
  emptyState?: {
    title: string;
    description?: string;
    action?: {
      label: string;
      onClick: () => void;
    };
  };
  onRowClick?: (row: T, index: number) => void;
  className?: string;
}

export const DataTable = <T extends Record<string, any>>({
  data,
  columns,
  actions,
  loading = false,
  searchable = true,
  filterable = false,
  sortable = true,
  pagination = { enabled: true, pageSize: 10 },
  selection,
  emptyState,
  onRowClick,
  className = ''
}: DataTableProps<T>) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(pagination.pageSize || 10);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [filters, setFilters] = useState<Record<string, string>>({});

  // Filter and search data
  const filteredData = useMemo(() => {
    let result = [...data];

    // Apply search
    if (searchTerm && searchable) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(searchLower)
        )
      );
    }

    // Apply column filters
    Object.entries(filters).forEach(([key, filterValue]) => {
      if (filterValue) {
        result = result.filter(row =>
          String(row[key]).toLowerCase().includes(filterValue.toLowerCase())
        );
      }
    });

    return result;
  }, [data, searchTerm, filters, searchable]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig || !sortable) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig, sortable]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pagination.enabled) return sortedData;

    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize, pagination.enabled]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const handleSort = (columnKey: string) => {
    if (!sortable) return;

    setSortConfig(prev => {
      if (prev?.key === columnKey) {
        return prev.direction === 'asc' 
          ? { key: columnKey, direction: 'desc' }
          : null;
      }
      return { key: columnKey, direction: 'asc' };
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set(paginatedData.map((_, index) => index)));
    } else {
      setSelectedItems(new Set());
    }
  };

  const handleSelectItem = (index: number, checked: boolean) => {
    const newSelected = new Set(selectedItems);
    if (checked) {
      newSelected.add(index);
    } else {
      newSelected.delete(index);
    }
    setSelectedItems(newSelected);
    
    if (selection?.onSelectionChange) {
      const selectedRows = Array.from(newSelected).map(i => paginatedData[i]);
      selection.onSelectionChange(selectedRows);
    }
  };

  const isAllSelected = selectedItems.size > 0 && selectedItems.size === paginatedData.length;
  const isPartiallySelected = selectedItems.size > 0 && selectedItems.size < paginatedData.length;

  if (loading) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading data...</p>
        </div>
      </div>
    );
  }

  if (!loading && data.length === 0) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {emptyState?.title || 'No data available'}
          </h3>
          {emptyState?.description && (
            <p className="text-gray-500 mb-4">{emptyState.description}</p>
          )}
          {emptyState?.action && (
            <ButtonEnhanced
              variant="primary"
              onClick={emptyState.action.onClick}
            >
              {emptyState.action.label}
            </ButtonEnhanced>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      {/* Table Header with Search and Filters */}
      {(searchable || filterable) && (
        <div className="p-4 border-b border-gray-200 space-y-4">
          <div className="flex items-center justify-between">
            {searchable && (
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              {filterable && (
                <ButtonEnhanced
                  variant="outline"
                  size="sm"
                  icon={Filter}
                  onClick={() => {/* Toggle filter panel */}}
                >
                  Filter
                </ButtonEnhanced>
              )}
              
              <ButtonEnhanced
                variant="outline"
                size="sm"
                icon={Download}
                onClick={() => {/* Export functionality */}}
              >
                Export
              </ButtonEnhanced>
            </div>
          </div>

          {/* Column Filters */}
          {filterable && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {columns.filter(col => col.filterable).map(column => (
                <div key={column.key}>
                  <input
                    type="text"
                    placeholder={`Filter ${column.label}...`}
                    value={filters[column.key] || ''}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      [column.key]: e.target.value
                    }))}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {selection?.enabled && (
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={input => {
                      if (input) input.indeterminate = isPartiallySelected;
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
              )}
              
              {columns.map(column => (
                <th
                  key={column.key}
                  className={`px-4 py-3 text-${column.align || 'left'} text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.headerClassName || ''
                  } ${column.sortable && sortable ? 'cursor-pointer hover:bg-gray-100' : ''}`}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {column.sortable && sortable && (
                      <div className="flex flex-col">
                        <ChevronUp 
                          className={`w-3 h-3 ${
                            sortConfig?.key === column.key && sortConfig.direction === 'asc'
                              ? 'text-blue-600' 
                              : 'text-gray-300'
                          }`} 
                        />
                        <ChevronDown 
                          className={`w-3 h-3 -mt-1 ${
                            sortConfig?.key === column.key && sortConfig.direction === 'desc'
                              ? 'text-blue-600' 
                              : 'text-gray-300'
                          }`} 
                        />
                      </div>
                    )}
                  </div>
                </th>
              ))}
              
              {actions && actions.length > 0 && (
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((row, index) => (
              <tr
                key={index}
                className={`hover:bg-gray-50 transition-colors ${
                  onRowClick ? 'cursor-pointer' : ''
                } ${selectedItems.has(index) ? 'bg-blue-50' : ''}`}
                onClick={() => onRowClick?.(row, index)}
              >
                {selection?.enabled && (
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(index)}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleSelectItem(index, e.target.checked);
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                )}
                
                {columns.map(column => (
                  <td
                    key={column.key}
                    className={`px-4 py-3 text-sm text-gray-900 text-${column.align || 'left'} ${
                      column.cellClassName || ''
                    }`}
                  >
                    {column.render 
                      ? column.render(row[column.key], row, index)
                      : String(row[column.key] || '')
                    }
                  </td>
                ))}
                
                {actions && actions.length > 0 && (
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {actions.map((action, actionIndex) => {
                        const Icon = action.icon;
                        const isDisabled = action.disabled?.(row);
                        
                        return (
                          <button
                            key={actionIndex}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!isDisabled) action.onClick(row, index);
                            }}
                            disabled={isDisabled}
                            className={`p-1.5 rounded-md transition-colors ${
                              isDisabled
                                ? 'text-gray-300 cursor-not-allowed'
                                : action.variant === 'danger'
                                ? 'text-red-600 hover:bg-red-50'
                                : action.variant === 'warning'
                                ? 'text-yellow-600 hover:bg-yellow-50'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                            title={action.label}
                          >
                            {Icon ? <Icon className="w-4 h-4" /> : action.label}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.enabled && totalPages > 1 && (
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-700">
            <span>
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} results
            </span>
            
            {pagination.showSizeSelector && (
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-gray-300 rounded text-sm px-2 py-1"
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
              </select>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <ButtonEnhanced
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </ButtonEnhanced>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                let page;
                if (totalPages <= 7) {
                  page = i + 1;
                } else {
                  if (currentPage <= 4) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 3) {
                    page = totalPages - 6 + i;
                  } else {
                    page = currentPage - 3 + i;
                  }
                }
                
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 text-sm rounded ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>
            
            <ButtonEnhanced
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </ButtonEnhanced>
          </div>
        </div>
      )}
    </div>
  );
};
