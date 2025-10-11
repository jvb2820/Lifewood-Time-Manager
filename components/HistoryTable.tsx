
import React from 'react';
import type { AttendanceRecord } from '../types';
import { formatDisplayDate, formatDisplayTime } from '../utils/time';

interface HistoryTableProps {
  records: AttendanceRecord[];
}

const HistoryTable: React.FC<HistoryTableProps> = ({ records }) => {

  return (
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
  );
};

export default HistoryTable;
