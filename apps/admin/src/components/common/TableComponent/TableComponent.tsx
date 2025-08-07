import React from 'react'
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getExpandedRowModel,
    flexRender,
} from '@tanstack/react-table'
import type { SortingState, ColumnDef, ExpandedState } from '@tanstack/react-table'
import { Input } from '@/components/ui/input'
import FuzzySearch from 'fuzzy-search'

type TableComponentProps<TData> = {
    data: TData[]
    columns: ColumnDef<TData, unknown>[]
    searchKeys?: string[]
    shortSearch?: boolean
    expandable?: boolean
    renderExpandedRow?: (row: TData) => React.ReactNode
    disableSearch?: boolean
}

export default function TableComponent<TData extends object>({
    data,
    columns,
    searchKeys = Object.keys(data[0] || {}),
    shortSearch = false,
    expandable = false,
    renderExpandedRow,
    disableSearch = false,
}: TableComponentProps<TData>) {
    const [search, setSearch] = React.useState('')
    const [filteredData, setFilteredData] = React.useState<TData[]>(data)
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [expanded, setExpanded] = React.useState<ExpandedState>({})

    React.useEffect(() => {
        if (disableSearch) {
            setFilteredData(data)
            return
        }
        const timeout = setTimeout(() => {
            if (!search.trim()) {
                setFilteredData(data)
            } else {
                const searcher = new FuzzySearch(data, searchKeys, {
                    caseSensitive: false,
                    sort: true,
                })
                setFilteredData(searcher.search(search))
            }
        }, 200) // 200ms debounce

        return () => clearTimeout(timeout)
    }, [search, data, searchKeys, disableSearch])

    // Add expand column if expandable is true
    const enhancedColumns = React.useMemo(() => {
        if (!expandable) return columns

        const expandColumn: ColumnDef<TData, unknown> = {
            id: 'expand',
            header: '',
            cell: ({ row }) => {
                return (
                    <button
                        onClick={() => row.toggleExpanded()}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        aria-label={row.getIsExpanded() ? 'Collapse row' : 'Expand row'}
                    >
                        {row.getIsExpanded() ? '▼' : '▶'}
                    </button>
                )
            },
            size: 50,
        }

        return [expandColumn, ...columns]
    }, [columns, expandable])

    const table = useReactTable({
        data: filteredData,
        columns: enhancedColumns,
        state: {
            sorting,
            expanded,
        },
        onSortingChange: setSorting,
        onExpandedChange: setExpanded,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
    })

    return (
        <div className="flex flex-col gap-2 w-full">
            {!disableSearch && (
                <Input
                    value={search}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                    className="w-full"
                    label="Search"
                    style={{
                        maxWidth: shortSearch ? '350px' : 'auto'
                    }}
                />
            )}
            <table className="w-full border-collapse bg-white">
                <thead>
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <th
                                    key={header.id}
                                    onClick={header.id !== 'expand' ? header.column.getToggleSortingHandler() : undefined}
                                    className={`text-center border-b border-gray-300 p-2 bg-black text-white ${
                                        header.id !== 'expand' ? 'cursor-pointer' : ''
                                    }`}
                                >
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                    {header.id !== 'expand' && ({
                                        asc: ' 🔼',
                                        desc: ' 🔽',
                                    }[header.column.getIsSorted() as string] ?? null)}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {table.getRowModel().rows.length > 0 ? (
                        table.getRowModel().rows.map(row => (
                            <React.Fragment key={row.id}>
                                <tr className="hover:bg-gray-50">
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id} className="text-center p-2 border-b border-gray-100">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                                {expandable && row.getIsExpanded() && renderExpandedRow && (
                                    <tr>
                                        <td colSpan={enhancedColumns.length} className="p-0 bg-gray-50">
                                            <div className="p-4 border-b border-gray-200">
                                                {renderExpandedRow(row.original)}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={enhancedColumns.length} className="text-center p-4 text-gray-500">
                                No Data Found
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}