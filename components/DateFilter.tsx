import React from 'react';

interface DateFilterProps {
  selectedDate: string; // YYYY-MM-DD format
  onDateChange: (date: string) => void;
  onClear: () => void;
}

const DateFilter: React.FC<DateFilterProps> = ({ selectedDate, onDateChange, onClear }) => {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl border border-border-color shadow-sm">
      <h2 className="text-xl font-semibold text-text-primary mb-4">Filter History</h2>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-grow w-full sm:w-auto">
          <label htmlFor="date-filter" className="sr-only">Filter by date</label>
          <input
            type="date"
            id="date-filter"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full px-4 py-3 bg-input-bg border border-border-color rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
          />
        </div>
        <button
          onClick={onClear}
          disabled={!selectedDate}
          className="w-full sm:w-auto px-6 py-3 border border-border-color rounded-md text-sm font-bold text-text-secondary hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Clear Filter
        </button>
      </div>
    </div>
  );
};

export default DateFilter;
