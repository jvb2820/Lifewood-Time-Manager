import React from 'react';
import type { AttendanceRecord } from '../types';

interface HistoryTableProps {
  records: AttendanceRecord[];
}

const HistoryTable: React.FC<HistoryTableProps> = ({ records }) => {

  const formatDisplayTime = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    } catch (e) {
        return 'Invalid Time';
    }
  }

   const formatDisplayDate = (dateString: string | null) => {
    if (!dateString) return '';
    try {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    } catch (e) {
        return '';
    }
  }


  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl border border-border-color shadow-sm">
      <h2 className="text-xl font-semibold text-text-primary mb-4">Attendance History</h2>
      <div className="overflow-x-auto">
        {records.length > 0 ? (
          <table className="min-w-full divide-y divide-border-color">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Clock In</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Clock Out</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Total Time</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-border-color">
              {records.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{formatDisplayDate(record.clock_in)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary font-semibold">{formatDisplayTime(record.clock_in)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary font-semibold">{record.clock_out ? formatDisplayTime(record.clock_out) : <span className="text-text-secondary italic">In Progress...</span>}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">{record.total_time || '...'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-10">
            <p className="text-text-secondary">No attendance records found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryTable;