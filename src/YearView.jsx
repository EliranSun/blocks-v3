import { useMemo } from "react";
import { format, startOfYear, eachMonthOfInterval, isSameMonth } from "date-fns";
import { CategoryColors } from "./constants";
import classNames from "classnames";

export const YearView = ({ currentDate, data = [], showDate = false, onBackToList }) => {
    // Group items by month for year view
    const yearData = useMemo(() => {
        if (!currentDate) return {};

        // Get the year range
        const baseDate = currentDate instanceof Date ? currentDate : new Date(currentDate);
        const yearStart = startOfYear(baseDate);
        const yearEnd = new Date(yearStart);
        yearEnd.setFullYear(yearEnd.getFullYear() + 1);
        yearEnd.setMonth(0); // January of next year
        yearEnd.setDate(0); // Last day of December

        // Create array of all months in the year
        const yearMonths = eachMonthOfInterval({ start: yearStart, end: yearEnd });

        // Group items by month
        const grouped = {};

        console.log({ yearMonths });

        yearMonths.forEach(month => {
            grouped[format(month, 'yyyy-MM')] = data.filter(item => {
                const itemDate = new Date(item.date);
                return isSameMonth(itemDate, month);
            });
        });

        return { yearMonths, grouped };
    }, [currentDate, data]);


    return (
        <div className="space-grotesk-400">
            <button
                onClick={onBackToList}
                className="mb-4 px-3 py-1 text-sm border rounded hover:bg-gray-100"
            >
                ← List View
            </button>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 w-full">
                {yearData.yearMonths?.map(month => {
                    const monthKey = format(month, 'yyyy-MM');
                    const monthItems = yearData.grouped[monthKey] || [];
                    return (
                        <div key={monthKey} className="flex flex-col p-2 min-h-[200px] max-h-[300px]">
                            <div className="font-semibold text-xs mb-2 text-center border-b pb-1 shrink-0">
                                {format(month, 'MMM')}<br />
                            </div>
                            <ul className="space-y-1 overflow-y-auto flex-1">
                                {monthItems
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
                                        // Sort by date (day) first, then by time
                                        const dateA = new Date(a.date);
                                        const dateB = new Date(b.date);
                                        if (dateA.getDate() !== dateB.getDate()) {
                                            return dateA.getDate() - dateB.getDate();
                                        }
                                        return getTime(a.date) - getTime(b.date);
                                    })
                                    .map(item => (
                                        <li
                                            key={item.date + item.name}
                                            className={classNames({
                                                "px-2 pt-1 text-center border-b-2": true,
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
};

