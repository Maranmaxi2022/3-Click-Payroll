// Helper to get badge styling based on entry type
const getEntryTypeStyle = (entryType) => {
  switch (entryType) {
    case 'vacation':
      return {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-700',
        badge: 'bg-blue-100 text-blue-700',
        label: 'Vacation'
      };
    case 'sick_leave':
      return {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-700',
        badge: 'bg-red-100 text-red-700',
        label: 'Sick Leave'
      };
    case 'stat_holiday':
      return {
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        text: 'text-purple-700',
        badge: 'bg-purple-100 text-purple-700',
        label: 'Holiday'
      };
    case 'unpaid':
      return {
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        text: 'text-gray-600',
        badge: 'bg-gray-100 text-gray-600',
        label: 'Unpaid'
      };
    case 'overtime':
      return {
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        text: 'text-amber-700',
        badge: 'bg-amber-100 text-amber-700',
        label: 'Overtime'
      };
    default: // regular
      return {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-700',
        badge: 'bg-green-100 text-green-700',
        label: 'Regular'
      };
  }
};

/**
 * Week View Schedule Cell - Shows detailed daily hours with shift times
 */
export function WeekScheduleCell({ timeEntry, isActive }) {
  if (!timeEntry) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-white text-sm text-slate-300">
        —
      </div>
    );
  }

  const style = getEntryTypeStyle(timeEntry.entry_type);
  const hasOT = timeEntry.overtime_hours > 0;

  // Format shift time: "09:00 AM - 06:00 PM"
  const formatShiftTime = (start, end) => {
    if (!start || !end) return null;

    const formatTime = (timeStr) => {
      // timeStr is in format "HH:MM:SS" or "HH:MM"
      const [hours, minutes] = timeStr.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${String(displayHour).padStart(2, '0')}:${minutes} ${ampm}`;
    };

    return `${formatTime(start)} - ${formatTime(end)}`;
  };

  return (
    <div className={`flex h-full w-full flex-col items-center justify-center p-3 ${style.bg} ${isActive ? 'ring-2 ring-inset ring-blue-400' : ''}`}>
      {/* Time-off badge (spans full width) */}
      {(timeEntry.entry_type === 'vacation' ||
        timeEntry.entry_type === 'sick_leave' ||
        timeEntry.entry_type === 'stat_holiday') ? (
        <div className={`w-full rounded-lg px-3 py-2 text-center ${style.badge}`}>
          <div className="text-base font-semibold">{style.label}</div>
          {timeEntry.hours_worked > 0 && (
            <div className="text-sm mt-1">{timeEntry.hours_worked}h</div>
          )}
        </div>
      ) : (
        <>
          {/* Shift time range - Large and prominent */}
          {timeEntry.shift_details?.shift_start && timeEntry.shift_details?.shift_end ? (
            <div className="text-center">
              <div className="text-base font-semibold text-slate-900">
                {formatShiftTime(timeEntry.shift_details.shift_start, timeEntry.shift_details.shift_end)}
              </div>
              {hasOT && (
                <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700">
                  +{timeEntry.overtime_hours}h OT
                </div>
              )}
            </div>
          ) : (
            // If no shift times, show hours worked
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">
                {timeEntry.hours_worked}h
              </div>
              {hasOT && (
                <div className="mt-2 text-xs text-slate-600">
                  {timeEntry.regular_hours}h + {timeEntry.overtime_hours}h OT
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/**
 * Month View Schedule Cell - Compact visualization with color coding
 */
export function MonthScheduleCell({ timeEntry, isActive }) {
  if (!timeEntry) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-white">
        <div className="h-1 w-1 rounded-full bg-slate-200" />
      </div>
    );
  }

  const style = getEntryTypeStyle(timeEntry.entry_type);
  const hasOT = timeEntry.overtime_hours > 0;

  return (
    <div className={`flex h-full w-full items-center justify-center ${style.bg} ${isActive ? 'ring-2 ring-blue-400 ring-inset' : ''}`}>
      {/* Time-off indicator */}
      {(timeEntry.entry_type === 'vacation' ||
        timeEntry.entry_type === 'sick_leave' ||
        timeEntry.entry_type === 'stat_holiday') ? (
        <div className={`text-[10px] font-bold ${style.text} uppercase`}>
          {style.label.substring(0, 3)}
        </div>
      ) : (
        <div className="flex flex-col items-center">
          {/* Hours as number */}
          <div className={`text-xs font-bold ${style.text}`}>
            {timeEntry.hours_worked}
          </div>
          {/* OT indicator */}
          {hasOT && (
            <div className="mt-0.5 h-1 w-3 rounded-full bg-amber-400" />
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Empty cell for days without entries
 */
export function EmptyScheduleCell({ isWeekView }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-white text-xs text-slate-300">
      {isWeekView ? '—' : <div className="h-1 w-1 rounded-full bg-slate-200" />}
    </div>
  );
}
