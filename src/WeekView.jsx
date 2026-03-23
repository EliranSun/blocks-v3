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

        // Get unique block names logged this week (preserving first-seen order)
        const seen = new Set();
        const uniqueBlocks = [];
        data.forEach(item => {
            if (!seen.has(item.name)) {
                seen.add(item.name);
                uniqueBlocks.push({
                    name: item.name,
                    category: item.category,
                });
            }
        });

        // Build matrix: for each block, for each day, find if logged
        const rows = uniqueBlocks.map(block => ({
            name: block.name,
            category: block.category,
            icon: BlockIcons[block.name] || block.name.charAt(0).toUpperCase(),
            cells: weekDays.map(day => {
                const dayKey = format(day, 'yyyy-MM-dd');
                const match = dayMap[dayKey]?.find(item => item.name === block.name);
                return { day, dayKey, logged: !!match, item: match };
            }),
        }));

        return { weekDays, rows };
    }, [currentDate, data]);

    return (
        <div className="space-grotesk-400">
            {/* Day selector row */}
            <div className="grid grid-cols-7 gap-1 mb-4">
                {weekData.weekDays?.map((day) => {
                    const today = isToday(day);
                    return (
                        <div key={format(day, 'yyyy-MM-dd')} className="flex flex-col items-center gap-0.5">
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
                        </div>
                    );
                })}
            </div>

            {/* Icon grid */}
            <div className="space-y-3">
                {weekData.rows?.map((row, rowIndex) => (
                    <motion.div
                        key={row.name}
                        className="grid grid-cols-7 gap-1 place-items-center"
                        custom={rowIndex}
                        variants={rowVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {row.cells.map((cell, colIndex) => {
                            const bgColor = cell.logged
                                ? CategoryBgColors[row.category?.toLowerCase()] || "bg-neutral-600"
                                : "bg-neutral-200 dark:bg-neutral-800";

                            return (
                                <motion.button
                                    key={cell.dayKey}
                                    whileTap={{ scale: 0.88 }}
                                    onClick={() => {
                                        if (cell.logged && onBlockClick) {
                                            onBlockClick(cell.item);
                                        } else if (!cell.logged && onAddBlock) {
                                            onAddBlock(cell.day);
                                        }
                                    }}
                                    className={classNames(
                                        "w-10 h-10 rounded-full flex flex-col items-center justify-center",
                                        "text-sm transition-colors",
                                        bgColor,
                                        cell.logged ? "text-white shadow-md" : "text-neutral-400 dark:text-neutral-600"
                                    )}
                                    title={cell.logged ? `${row.name} - ${format(cell.day, 'EEE d')}` : `Add for ${format(cell.day, 'EEE d')}`}
                                >
                                    {cell.logged ? (
                                        <span className="text-base leading-none">{row.icon}</span>
                                    ) : null}
                                </motion.button>
                            );
                        })}
                        {/* Show label below first logged cell in the row */}
                        {rowIndex < 3 && (
                            <div className="col-span-7 -mt-2">
                                <span className="text-[8px] text-neutral-400 dark:text-neutral-500 font-semibold tracking-wider uppercase ml-1">
                                    {row.name}
                                </span>
                            </div>
                        )}
                    </motion.div>
                ))}

                {/* Add row */}
                {onAddBlock && (
                    <div className="grid grid-cols-7 gap-1 place-items-center">
                        {weekData.weekDays?.map((day) => (
                            <motion.button
                                key={format(day, 'yyyy-MM-dd') + '-add'}
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
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
