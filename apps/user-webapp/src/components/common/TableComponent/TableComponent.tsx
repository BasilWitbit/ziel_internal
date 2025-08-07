import React from 'react'
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    flexRender,
} from '@tanstack/react-table'
import type { SortingState, ColumnDef } from '@tanstack/react-table'
import { Input } from '@/components/ui/input'
import FuzzySearch from 'fuzzy-search'

type TableComponentProps<TData> = {
    data: TData[]
    columns: ColumnDef<TData, unknown>[]
    searchKeys?: string[],
    shortSearch?: boolean
}

export default function TableComponent<TData extends object>({
    data,
    columns,
    searchKeys = Object.keys(data[0] || {}),
    shortSearch = false,
}: TableComponentProps<TData>) {
    const [search, setSearch] = React.useState('')
    const [filteredData, setFilteredData] = React.useState<TData[]>(data)
    const [sorting, setSorting] = React.useState<SortingState>([])

    React.useEffect(() => {
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
    }, [search, data, searchKeys])

    const table = useReactTable({
        data: filteredData,
        columns,
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    })

    return (
        <div className="flex flex-col gap-2 w-full">
            <Input
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                className="w-full"
                label="Search"
                style={{
                    maxWidth: shortSearch ? '350px' : 'auto'
                }}
            />
            <table className="w-full border-collapse bg-white">
                <thead>
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <th
                                    key={header.id}
                                    onClick={header.column.getToggleSortingHandler()}
                                    className="cursor-pointer text-center border-b border-gray-300 p-2 bg-black text-white"
                                >
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                    {({
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
                            <tr key={row.id}>
                                {row.getVisibleCells().map(cell => (
                                    <td key={cell.id} className="text-center p-2">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={columns.length} className="text-center p-4 text-gray-500">
                                No Data Found
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}
