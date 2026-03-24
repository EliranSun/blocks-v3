import { useMemo } from "react";
import { format, startOfWeek, eachDayOfInterval, isSameDay, isToday } from "date-fns";
import { BlockIcons, CategoryBgColors } from "./constants";
import { motion } from "framer-motion";
import classNames from "classnames";

const rowVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: i * 0.04,
            type: "spring",
            damping: 20,
            stiffness: 300,
        },
    }),
};

export const WeekView = ({
    currentDate,
    data = [],
    onBlockClick,
    onAddBlock,
}) => {
    const weekData = useMemo(() => {
        if (!currentDate) return { weekDays: [], rows: [] };

        const baseDate = currentDate instanceof Date ? currentDate : new Date(currentDate);
        const weekStart = startOfWeek(baseDate, { weekStartsOn: 1 });
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

        // Group data by day
        const dayMap = {};
        weekDays.forEach(day => {
            dayMap[format(day, 'yyyy-MM-dd')] = [];
        });
        data.forEach(item => {
            const key = format(new Date(item.date), 'yyyy-MM-dd');
            if (dayMap[key]) {
                dayMap[key].push(item);
            }
        });

        // Build day columns: each day has its list of logged blocks
        const dayColumns = weekDays.map(day => {
            const dayKey = format(day, 'yyyy-MM-dd');
            const items = (dayMap[dayKey] || []).map(item => ({
                ...item,
                icon: BlockIcons[item.name] || item.name.charAt(0).toUpperCase(),
            }));
            return { day, dayKey, items };
        });

        return { weekDays, dayColumns };
    }, [currentDate, data]);

    return (
        <div className="space-grotesk-400">
            {/* Day columns with headers and blocks */}
            <div className="grid grid-cols-7 gap-1">
                {weekData.dayColumns?.map(({ day, dayKey, items }, colIndex) => {
                    const today = isToday(day);
                    return (
                        <div key={dayKey} className="flex flex-col items-center gap-1.5">
                            {/* Day header */}
                            <span className={classNames(
                                "text-[10px] font-semibold tracking-wide",
                                today ? "text-blue-500 dark:text-blue-400" : "text-neutral-400 dark:text-neutral-500"
                            )}>
                                {format(day, 'EEE').toUpperCase()}
                            </span>
                            <span className={classNames(
                                "text-lg font-bold",
                                today ? "text-blue-500 dark:text-blue-400" : "text-neutral-700 dark:text-neutral-200"
                            )}>
                                {format(day, 'd')}
                            </span>
                            {today && (
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400" />
                            )}

                            {/* Blocks for this day */}
                            {items.map((item, i) => {
                                const bgColor = CategoryBgColors[item.category?.toLowerCase()] || "bg-neutral-600";
                                return (
                                    <motion.button
                                        key={`${item.name}-${dayKey}`}
                                        variants={rowVariants}
                                        custom={colIndex}
                                        initial="hidden"
                                        animate="visible"
                                        whileTap={{ scale: 0.88 }}
                                        onClick={() => onBlockClick && onBlockClick(item)}
                                        className={classNames(
                                            "w-10 h-10 rounded-full flex items-center justify-center",
                                            "text-sm transition-colors text-white shadow-md",
                                            bgColor,
                                        )}
                                        title={`${item.name} - ${format(day, 'EEE d')}`}
                                    >
                                        <span className="text-base leading-none">{item.icon}</span>
                                    </motion.button>
                                );
                            })}

                            {/* Add button */}
                            {onAddBlock && (
                                <motion.button
                                    whileTap={{ scale: 0.88 }}
                                    onClick={() => onAddBlock(day)}
                                    className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-neutral-400 dark:text-neutral-600 hover:text-neutral-500 dark:hover:text-neutral-400 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors"
                                    title={`Add block for ${format(day, 'EEE d')}`}
                                >
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="8" y1="3" x2="8" y2="13" />
                                        <line x1="3" y1="8" x2="13" y2="8" />
                                    </svg>
                                </motion.button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
