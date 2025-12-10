import { useState, useMemo } from "react";
import { format, startOfWeek, eachDayOfInterval, isSameDay } from "date-fns";
import { CategoryColors } from "./constants";
import classNames from "classnames";

export const BlocksList = ({ currentDate, data = [], showDate = false }) => {
    const [weekView, setWeekView] = useState(false);

    // Group items by day for week view
    const weekData = useMemo(() => {
        if (!currentDate) return {};

        // Get the week range (Sunday to Saturday)
        const baseDate = currentDate instanceof Date ? currentDate : new Date(currentDate);
        const weekStart = startOfWeek(baseDate, { weekStartsOn: 0 });
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);

        // Create array of all days in the week
        const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

        // Group items by day
        const grouped = {};
        weekDays.forEach(day => {
            grouped[format(day, 'yyyy-MM-dd')] = data.filter(item => {
                const itemDate = new Date(item.date);
                return isSameDay(itemDate, day);
            });
        });

        return { weekDays, grouped };
    }, [currentDate, data]);

    if (weekView) {
        return (
            <div className="space-grotesk-400">
                <button
                    onClick={() => setWeekView(false)}
                    className="mb-4 px-3 py-1 text-sm border rounded hover:bg-gray-100"
                >
                    ← List View
                </button>
                <div className="flex gap-2 w-full overflow-x-auto">
                    {weekData.weekDays?.map(day => {
                        const dayKey = format(day, 'yyyy-MM-dd');
                        const dayItems = weekData.grouped[dayKey] || [];
                        return (
                            <div key={dayKey} className="flex-1">
                                <div className="font-semibold text-xs mb-2 text-center border-b pb-1">
                                    {format(day, 'EEE')}
                                    <br />
                                    <span className="text-gray-500">{format(day, 'd/MM')}</span>
                                </div>
                                <ul className="space-y-1">
                                    {dayItems
                                        .sort((a, b) => {
                                            // Extract time from date string (format: "YYYY-MM-DD" or "YYYY-MM-DDTHH:mm")
                                            const getTime = (dateStr) => {
                                                if (dateStr.includes('T')) {
                                                    // Has time component
                                                    const timePart = dateStr.split('T')[1];
                                                    const [hours, minutes] = timePart.split(':').map(Number);
                                                    return hours * 60 + (minutes || 0); // Convert to minutes for easier comparison
                                                }
                                                // No time component, treat as midnight (00:00)
                                                return 0;
                                            };
                                            return getTime(a.date) - getTime(b.date);
                                        })
                                        .map(item => (
                                            <li
                                                key={item.date + item.name}
                                                className={classNames({
                                                    "px-2 pt-1 text-center border-2": true,
                                                    "font-bold text-shadow-2 text-xs text-left": true,
                                                    [CategoryColors[item.category.toLowerCase()]]: true,
                                                })}
                                            >
                                                {[item.name].concat(showDate ? ` - ${format(item.date, "d/MM/yy, EEE")}` : [])}
                                            </li>
                                        ))}
                                </ul>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    return (
        <div className="space-grotesk-400">
            <button
                onClick={() => setWeekView(true)}
                className="mb-4 px-3 py-1 text-sm border rounded hover:bg-gray-100"
            >
                Week View →
            </button>
            <ul className='flex flex-wrap gap-2'>
                {data.reverse().map(item =>
                    <li
                        key={item.date + item.name}
                        className={classNames({
                            "px-2 pt-1 text-center border-b-2": true,
                            "font-bold text-sm grow-0 text-left": true,
                            [CategoryColors[item.category.toLowerCase()]]: true,
                        })}>
                        {[item.name].concat(showDate ? ` - ${format(item.date, "d/MM/yy, EEE")}` : [])}
                    </li>)}
            </ul>
        </div>
    )
}