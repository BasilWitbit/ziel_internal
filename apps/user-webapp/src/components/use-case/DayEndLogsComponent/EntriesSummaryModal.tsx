import { Button } from '@/components/ui/button'
import { capitalizeWords } from '@/utils/helpers'
import { Delete, X, Clock, Calendar, Building } from 'lucide-react'
import { type FC } from 'react'
import type { DayEndLogEntry } from './SingleDayForm'

type IProps = {
    isOpen: boolean;
    onClose: () => void;
    logs: DayEndLogEntry[];
    projectName: string;
    date: string;
    onDeleteEntry: (index: number) => void;
    onSaveAndNext: () => void;
}

const EntriesSummaryModal: FC<IProps> = ({ 
    isOpen, 
    onClose, 
    logs, 
    projectName, 
    date, 
    onDeleteEntry, 
    onSaveAndNext 
}) => {
    if (!isOpen) return null;

    const totalTime = logs.reduce((sum, log) => sum + log.timeTaken, 0);

    return (
        <div className="flex flex-col max-h-[80vh] my-8 mx-4">
            {/* Header */}
            <div className="flex items-center justify-between p-3 md:p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                <div className="flex flex-col gap-1">
                    <h2 className="text-lg md:text-xl font-bold text-gray-800">Time Log Summary</h2>
                    <div className="flex flex-wrap items-center gap-1.5 md:gap-3 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                            <Building className="w-3 h-3" />
                            <span className="font-medium truncate max-w-[120px]">{projectName}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span className="hidden md:inline">{new Date(date).toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            })}</span>
                            <span className="md:hidden">{new Date(date).toLocaleDateString('en-US')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span className="font-medium">{totalTime.toFixed(2)}h total</span>
                        </div>
                    </div>
                </div>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700 flex-shrink-0 h-8 w-8 p-0"
                >
                    <X className="w-4 h-4" />
                </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-3 md:p-4">
                {logs.length === 0 ? (
                    <div className="text-center py-8">
                        <Clock className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 text-base">No entries logged yet</p>
                        <p className="text-gray-400 text-sm">Add some time entries to see them here</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {/* Summary Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-3 mb-3 md:mb-4">
                            <div className="bg-yellow-50 rounded-lg p-2.5 md:p-3 text-center">
                                <div className="text-lg md:text-xl font-bold text-yellow-600">{logs.length}</div>
                                <div className="text-xs text-yellow-600">Total Entries</div>
                            </div>
                            <div className="bg-green-50 rounded-lg p-2.5 md:p-3 text-center">
                                <div className="text-lg md:text-xl font-bold text-green-600">{totalTime.toFixed(1)}h</div>
                                <div className="text-xs text-green-600">Total Time</div>
                            </div>
                            <div className="bg-blue-50 rounded-lg p-2.5 md:p-3 text-center">
                                <div className="text-lg md:text-xl font-bold text-blue-600">
                                    {logs.filter(log => log.type === 'work').length}
                                </div>
                                <div className="text-xs text-blue-600">Work</div>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-2.5 md:p-3 text-center">
                                <div className="text-lg md:text-xl font-bold text-purple-600">
                                    {logs.filter(log => log.type === 'meeting').length}
                                </div>
                                <div className="text-xs text-purple-600">Meetings</div>
                            </div>
                             <div className="bg-red-50 rounded-lg p-2.5 md:p-3 text-center">
                                <div className="text-lg md:text-xl font-bold text-red-600">
                                    {logs.filter(log => log.type === 'break').length}
                                </div>
                                <div className="text-xs text-red-600">Break</div>
                            </div>
                        </div>

                        {/* Entries Table */}
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className="overflow-x-auto">
                                <div className="max-h-[40vh] overflow-y-auto">
                                    <table className='w-full min-w-[600px]'>
                                        <thead className="bg-gray-50 sticky top-0 z-10">
                                            <tr className='border-b border-gray-200'>
                                                <th className="px-2 md:px-3 py-2 text-left text-xs font-medium text-gray-700 min-w-[100px]">
                                                    Feature Title
                                                </th>
                                                <th className="px-2 md:px-3 py-2 text-left text-xs font-medium text-gray-700 min-w-[200px]">
                                                    Task Description
                                                </th>
                                                <th className="px-2 md:px-3 py-2 text-center text-xs font-medium text-gray-700 min-w-[70px]">
                                                    Type
                                                </th>
                                                <th className="px-2 md:px-3 py-2 text-center text-xs font-medium text-gray-700 min-w-[70px]">
                                                    Time (hrs)
                                                </th>
                                                <th className="px-2 md:px-3 py-2 text-center text-xs font-medium text-gray-700 min-w-[60px]">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {logs.map((eachLog, index) => {
                                                return (
                                                    <tr key={index} className='hover:bg-gray-50 transition-colors'>
                                                        <td className="px-2 md:px-3 py-2 md:py-2.5 text-xs">
                                                            <div className="max-w-[100px] md:max-w-[120px] truncate" title={eachLog.featureTitle}>
                                                                {capitalizeWords(eachLog.featureTitle) || '-'}
                                                            </div>
                                                        </td>
                                                        <td className="px-2 md:px-3 py-2 md:py-2.5 text-xs">
                                                            <div className="max-w-[200px] md:max-w-[300px] break-words">
                                                                {capitalizeWords(eachLog.taskDescription)}
                                                            </div>
                                                        </td>
                                                        <td className="px-2 md:px-3 py-2 md:py-2.5 text-center">
                                                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                                                                eachLog.type === 'work' ? 'bg-blue-100 text-blue-800' :
                                                                eachLog.type === 'meeting' ? 'bg-purple-100 text-purple-800' :
                                                                eachLog.type === 'break' ? 'bg-red-100 text-red-800' :
                                                                'bg-gray-100 text-gray-800'
                                                            }`}>
                                                                {eachLog.type}
                                                            </span>
                                                        </td>
                                                        <td className="px-2 md:px-3 py-2 md:py-2.5 text-center text-xs font-medium">
                                                            {eachLog.timeTaken}
                                                        </td>
                                                        <td className="px-2 md:px-3 py-2 md:py-2.5 text-center">
                                                            <Button 
                                                                onClick={() => onDeleteEntry(index)} 
                                                                variant="ghost" 
                                                                size='sm'
                                                                className="text-red-500 hover:text-red-red-700 hover:bg-red-50 h-6 w-6 p-0"
                                                            >
                                                                <Delete className="w-3 h-3" />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-2 p-3 md:p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
                <Button 
                    variant="outline" 
                    onClick={onClose}
                    className="px-3 md:px-4 w-full md:w-auto h-8 text-sm order-2 md:order-1"
                >
                    Close
                </Button>
                
                {logs.length > 0 && (
                    <Button 
                        className="bg-black text-white hover:bg-gray-900 text-white px-3 md:px-4 w-full md:w-auto h-8 text-sm order-1 md:order-2"
                        onClick={() => {
                            onSaveAndNext();
                            onClose();
                        }}
                    >
                        Submit and Checkout
                    </Button>
                )}
            </div>
        </div>
    )
}

export default EntriesSummaryModal