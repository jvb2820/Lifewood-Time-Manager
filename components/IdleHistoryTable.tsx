
import React from 'react';
import type { IdleRecord } from '../types';
import { formatDisplayDate, formatDisplayTime, formatSecondsToMinutesSeconds } from '../utils/time';

interface IdleHistoryTableProps {
  records: IdleRecord[];
}

const IdleHistoryTable: React.FC<IdleHistoryTableProps> = ({ records }) => {
  return (
    <div className="overflow-x-auto">
      {records.length > 0 ? (
        <table className="min-w-full divide-y divide-border-color">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Idle Start</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Idle End</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Duration</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-border-color">
            {records.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{formatDisplayDate(record.idle_start)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary font-semibold">{formatDisplayTime(record.idle_start)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary font-semibold">
                  {record.idle_end ? formatDisplayTime(record.idle_end) : <span className="text-text-secondary italic">...</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                  {record.duration_seconds ? formatSecondsToMinutesSeconds(record.duration_seconds) : '...'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="text-center py-10">
          <p className="text-text-secondary">No idle time records found.</p>
        </div>
      )}
    </div>
  );
};

export default IdleHistoryTable;
