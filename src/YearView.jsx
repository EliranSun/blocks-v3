import { useMemo } from "react";
import { format, startOfYear, eachMonthOfInterval, isSameMonth } from "date-fns";
import { Block } from "./Block";

export const YearView = ({ currentDate, data = [], showDate = false, showNote = false, onBackToList, onBlockClick }) => {
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
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 w-full">
                {yearData.yearMonths?.map(month => {
                    const monthKey = format(month, 'yyyy-MM');
                    const monthItems = yearData.grouped[monthKey] || [];
                    return (
                        <div key={monthKey} className="flex flex-col p-2 h-[18vh]">
                            <div className="font-semibold text-xs mb-2 text-center border-b pb-1 shrink-0">
                                {format(month, 'MMM')}<br />
                            </div>
                            <ol className="space-y-1 list-decimal overflow-y-auto flex-1">
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
                                        <Block
                                            key={item.date + item.name}
                                            item={item}
                                            showNote={showNote}
                                            showDate={showDate}
                                            variant="year"
                                            onClick={onBlockClick}
                                        />
                                    ))}
                            </ol>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

