import { useEffect, useState } from 'react'
import type { TimelogData } from '.';

type Filters = 'all' | 'pending' | 'completed'

export const FILTERS = {
    all: 'All Timelogs',
    pending: 'Pending Timelogs',
    completed: 'Completed Timelogs',
}

export const ITEMS_PER_PAGE = 5;

const useData = (data: TimelogData[], providedSummary: { projectName: string; user: { name: string; role: string; email: string } } | null = null) => {
    const [filter, setFilter] = useState<Filters>('all');
    const [currentPage, setCurrentPage] = useState(1);

    // Minimal fallbacks when no provided summary is available
    const DEFAULT_PROJECT_NAME = 'Unknown Project';
    const DEFAULT_USER = { name: 'Unknown User', role: '', email: '' };

    const SUMMARY = {
        completedLogs: data.filter(log => log.status === 'completed').length,
        pendingLogs: data.filter(log => log.status === 'pending').length,
        totalLogs: data.length,
        projectName: providedSummary?.projectName ?? DEFAULT_PROJECT_NAME,
        user: providedSummary?.user ?? DEFAULT_USER
    }

    // Filter data based on selected filter
    const filteredData = data.filter(eachLog => {
        switch (filter) {
            case 'all':
                return true;
            case 'pending':
                return eachLog.status === 'pending';
            case 'completed':
                return eachLog.status === 'completed';
        }
    });

    // Calculate pagination
    const totalItems = filteredData.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    const nextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(prev => prev + 1);
        }
    }

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
        }
    }

    const goToPage = (page: number) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    }

    const PAGINATION_OPTIONS = {
        currentPage, totalPages, totalItems, startIndex, endIndex,
        nextPage, prevPage, goToPage
    }

    // Reset to page 1 when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [filter]);

    return {
        paginatedData,
        filter,
        summary: SUMMARY,
        paginationOptions: PAGINATION_OPTIONS,
        setFilter
    }
}

export default useData