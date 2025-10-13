/**
 * Formats a Date object into an ISO 8601 string, which is the recommended
 * format for storing timestamps in a database.
 * e.g., "2024-07-27T15:30:00.000Z"
 */
export const formatDateForDB = (date: Date): string => {
  return date.toISOString();
};

/**
 * Calculates the duration between two date strings and returns it in HH:MM format.
 */
export const calculateDuration = (clockInStr: string, clockOutStr:string): string => {
  const clockInTime = new Date(clockInStr).getTime();
  const clockOutTime = new Date(clockOutStr).getTime();

  if (isNaN(clockInTime) || isNaN(clockOutTime) || clockOutTime < clockInTime) {
    return '00:00';
  }

  const durationMs = clockOutTime - clockInTime;
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

/**
 * Parses a duration string "HH:MM" into total minutes.
 */
export const parseDurationToMinutes = (duration: string | null): number => {
  if (!duration) return 0;
  const parts = duration.split(':');
  if (parts.length !== 2) return 0;
  
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);

  if (isNaN(hours) || isNaN(minutes)) return 0;
  
  return hours * 60 + minutes;
};

/**
 * Formats total minutes into a human-readable "Xh Ym" string.
 */
export const formatMinutesToHoursMinutes = (totalMinutes: number): string => {
  if (totalMinutes < 0) return '0h 0m';
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
};

/**
 * Formats total seconds into an HH:MM:SS string.
 */
export const formatSecondsToHHMMSS = (totalSeconds: number): string => {
  if (totalSeconds < 0) return '00:00:00';

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

/**
 * Formats total seconds into a human-readable "Xm Ys" string.
 */
export const formatSecondsToMinutesSeconds = (totalSeconds: number): string => {
    if (totalSeconds < 0) return '0m 0s';
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds}s`;
};

/**
 * Formats a date string into a localized time string (e.g., "03:30 PM").
 */
export const formatDisplayTime = (dateString: string | null): string => {
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
};

/**
 * Formats a date string into a localized, detailed date string (e.g., "Wed, Jul 27, 2024").
 */
export const formatDisplayDate = (dateString: string | null): string => {
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
};
