import { useMemo } from "react";
import { format, startOfWeek, eachDayOfInterval, isSameDay, addDays } from "date-fns";
import classNames from "classnames";
import { Block } from "./Block";
import { motion } from "framer-motion";

const dayColumnVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: i * 0.05,
            type: "spring",
            damping: 20,
            stiffness: 300,
        },
    }),
};

const blockListVariants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.03,
        },
    },
};

export const WeekView = ({
    currentDate,
    data = [],
    blockProps = {},
    onBlockClick,
    onAddBlock
}) => {
    // Group items by day for week view
    const weekData = useMemo(() => {
        if (!currentDate) return {};

        // Get the week range (Sunday to Saturday)
        const baseDate = currentDate instanceof Date ? currentDate : new Date(currentDate);
        const weekStart = startOfWeek(baseDate, { weekStartsOn: 0 });
        const weekEnd = addDays(weekStart, 6);

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

    const today = new Date();

    return (
        <div className="overflow-x-auto">
            <div className={classNames(
                "rounded-sm p-1",
                {
                    "bg-white dark:bg-neutral-900": false,
                    "border-2 md:border-[3px] border-black dark:border-white": false,
                    "shadow-[3px_3px_0_0_#000] md:shadow-[5px_5px_0_0_#000] dark:shadow-[3px_3px_0_0_#fff] dark:md:shadow-[5px_5px_0_0_#fff]": false,
                }
            )}>
                <div className="flex gap-1 w-full">
                    {weekData.weekDays?.map((day, index) => {
                        const dayKey = format(day, 'yyyy-MM-dd');
                        const dayItems = weekData.grouped[dayKey] || [];
                        const isToday = isSameDay(day, today);
                        return (
                            <motion.div
                                key={dayKey}
                                className="flex flex-col flex-grow"
                                custom={index}
                                variants={dayColumnVariants}
                                initial="hidden"
                                animate="visible"
                            >
                                <div
                                    className={classNames(
                                        "text-center py-1 mb-1 border-b-2 border-black dark:border-white",
                                        "font-bold uppercase tracking-tight space-grotesk-600 text-[10px] md:text-xs leading-none",
                                        isToday ? "bg-black text-white dark:bg-white dark:text-black" : "text-black dark:text-white"
                                    )}
                                >
                                    {format(day, 'EEEEE')}
                                    <div className="text-[10px] md:text-xs font-black mt-0.5">
                                        {format(day, 'd')}
                                    </div>
                                </div>
                                <motion.ul
                                    className="space-y-1"
                                    variants={blockListVariants}
                                    initial="hidden"
                                    animate="visible"
                                >
                                    {dayItems
                                        .sort((a, b) => {
                                            const getTime = (dateStr) => {
                                                if (dateStr.includes('T')) {
                                                    const timePart = dateStr.split('T')[1];
                                                    const [hours, minutes] = timePart.split(':').map(Number);
                                                    return hours * 60 + (minutes || 0);
                                                }
                                                return 0;
                                            };
                                            return getTime(a.date) - getTime(b.date);
                                        })
                                        .map(item => (
                                            <Block
                                                key={item.date + item.name}
                                                item={item}
                                                variant="week"
                                                {...blockProps}
                                                onClick={onBlockClick}
                                            />
                                        ))}
                                </motion.ul>
                                {onAddBlock && (
                                    <motion.button
                                        whileTap={{ translateX: 2, translateY: 2, boxShadow: "0 0 0 0 #000" }}
                                        onClick={() => onAddBlock(day)}
                                        className="w-full mt-1 py-0.5 rounded-sm border-2 
                                        border-black dark:border-white bg-white 
                                        dark:bg-neutral-800 text-black dark:text-white
                                        font-black text-sm leading-none shadow-[2px_2px_0_0_#000] 
                                        dark:shadow-[2px_2px_0_0_#fff] transition-[transform,box-shadow] 
                                        duration-75"
                                        title={`Add block for ${format(day, 'EEE d/MM')}`}
                                    >
                                        +
                                    </motion.button>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
