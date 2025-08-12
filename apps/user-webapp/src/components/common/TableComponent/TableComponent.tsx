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
import { ChevronRight } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

type TableComponentProps<TData> = {
    data: TData[]
    columns: ColumnDef<TData, unknown>[]
    searchKeys?: string[]
    shortSearch?: boolean
    expandable?: boolean
    renderExpandedRow?: (row: TData) => React.ReactNode
    disableSearch?: boolean
}

// Collapsible <tr> with true expand/collapse animation (height measuring).
function CollapsibleRow({
    colSpan,
    open,
    children,
    duration = 220,
}: {
    colSpan: number
    open: boolean
    children: React.ReactNode
    duration?: number
}) {
    const outerRef = React.useRef<HTMLDivElement | null>(null)
    const [rendered, setRendered] = React.useState<boolean>(open)

    // Expand/collapse logic
    React.useLayoutEffect(() => {
        const el = outerRef.current
        if (!el) return

        if (open) {
            // Mount content and animate from 0 -> measured height -> auto
            setRendered(true)
            // Start from 0 to allow transition
            el.style.height = '0px'
            el.style.overflow = 'hidden'
            // Measure on next frame and expand
            requestAnimationFrame(() => {
                const h = el.scrollHeight
                el.style.transition = `height ${duration}ms ease`
                el.style.height = `${h}px`
            })
        } else {
            // Collapse: lock current pixel height first (auto -> px), then animate to 0
            // If we were at auto, set to current scrollHeight to make it animatable
            const currentHeight = el.getBoundingClientRect().height || el.scrollHeight
            el.style.height = `${currentHeight}px`
            el.style.overflow = 'hidden'
            // Force reflow so the browser registers the height before we change it
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            el.offsetHeight
            // Now animate to 0
            el.style.transition = `height ${duration}ms ease`
            el.style.height = '0px'
        }
    }, [open, duration])

    const onTransitionEnd = React.useCallback(
        (e: React.TransitionEvent<HTMLDivElement>) => {
            if (e.propertyName !== 'height') return
            const el = outerRef.current
            if (!el) return
            if (open) {
                // Lock to auto after expanding
                el.style.transition = ''
                el.style.height = 'auto'
                el.style.overflow = 'visible'
            } else {
                // After collapse, unmount for a11y/perf
                setRendered(false)
            }
        },
        [open]
    )

    return (
        <TableRow aria-hidden={!rendered} style={{ visibility: rendered ? 'visible' : 'hidden' }}>
            <TableCell colSpan={colSpan} className="p-0">
                <div ref={outerRef} onTransitionEnd={onTransitionEnd} style={{ height: open ? 'auto' : '0px' }}>
                    {/* Optional fade for content */}
                    <div
                        className={open ? 'opacity-100' : 'opacity-0'}
                        style={{ transition: `opacity ${duration}ms ease` }}
                    >
                        {rendered ? children : null}
                    </div>
                </div>
            </TableCell>
        </TableRow>
    )
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
        }, 200)
        return () => clearTimeout(timeout)
    }, [search, data, searchKeys, disableSearch])

    const enhancedColumns = React.useMemo(() => {
        if (!expandable) return columns
        const expandColumn: ColumnDef<TData, unknown> = {
            id: 'expand',
            header: '',
            cell: ({ row }) => {
                const isOpen = row.getIsExpanded()
                return (
                    <button
                        onClick={() => row.toggleExpanded()}
                        className="rounded transition-colors flex items-center justify-center"
                        aria-label={isOpen ? 'Collapse row' : 'Expand row'}
                    >
                        <span
                            className="inline-flex transition-transform duration-200"
                            style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
                        >
                            <ChevronRight color="#a8a8a8" size={20} />
                        </span>
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
                    style={{ maxWidth: shortSearch ? '350px' : 'auto' }}
                />
            )}

            <Table className="w-full">
                <TableHeader>
                    {table.getHeaderGroups().map(headerGroup => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <TableHead
                                    key={header.id}
                                    onClick={header.id !== 'expand' ? header.column.getToggleSortingHandler() : undefined}
                                    className={`text-center ${header.id !== 'expand' ? 'cursor-pointer select-none' : ''}`}
                                >
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                    {header.id !== 'expand' && ({
                                        asc: ' 🔼',
                                        desc: ' 🔽',
                                    }[header.column.getIsSorted() as string] ?? null)}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>

                <TableBody>
                    {table.getRowModel().rows.length > 0 ? (
                        table.getRowModel().rows.map(row => {
                            const isOpen = row.getIsExpanded()
                            return (
                                <React.Fragment key={row.id}>
                                    <TableRow className="hover:bg-gray-50">
                                        {row.getVisibleCells().map(cell => (
                                            <TableCell key={cell.id} className="text-center">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>

                                    {expandable && renderExpandedRow && (
                                        <CollapsibleRow colSpan={enhancedColumns.length} open={isOpen}>
                                            <div className="p-3">
                                                {renderExpandedRow(row.original)}
                                            </div>
                                        </CollapsibleRow>
                                    )}
                                </React.Fragment>
                            )
                        })
                    ) : (
                        <TableRow>
                            <TableCell colSpan={enhancedColumns.length} className="text-center">
                                No Data Found
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
