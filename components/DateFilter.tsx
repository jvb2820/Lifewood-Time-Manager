
import React from 'react';

interface DateFilterProps {
  dateRange: { start: string; end: string };
  onDateRangeChange: (range: { start: string; end: string }) => void;
  onClear: () => void;
}

const DateFilter: React.FC<DateFilterProps> = ({ dateRange, onDateRangeChange, onClear }) => {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl border border-border-color shadow-sm">
      <h2 className="text-xl font-semibold text-text-primary mb-4">Time Filter</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-4">
        <div className="flex-grow">
          <label htmlFor="start-date-filter" className="block text-sm font-medium text-text-secondary mb-1">Start Date</label>
          <input
            type="date"
            id="start-date-filter"
            value={dateRange.start}
            onChange={(e) => onDateRangeChange({ ...dateRange, start: e.target.value })}
            className="w-full px-4 py-3 bg-input-bg border border-border-color rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
          />
        </div>
        <div className="flex-grow">
          <label htmlFor="end-date-filter" className="block text-sm font-medium text-text-secondary mb-1">End Date</label>
          <input
            type="date"
            id="end-date-filter"
            value={dateRange.end}
            min={dateRange.start}
            onChange={(e) => onDateRangeChange({ ...dateRange, end: e.target.value })}
            className="w-full px-4 py-3 bg-input-bg border border-border-color rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
          />
        </div>
        <div className="self-end">
        <button
          onClick={onClear}
          disabled={!dateRange.start && !dateRange.end}
          className="w-full px-6 py-3 border border-border-color rounded-md text-sm font-bold text-text-secondary hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Clear Filter
        </button>
        </div>
      </div>
    </div>
  );
};

export default DateFilter;
