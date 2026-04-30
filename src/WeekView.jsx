import { useMemo } from "react";
import { format, startOfWeek, eachDayOfInterval, isSameDay, addDays } from "date-fns";
import classNames from "classnames";
import { Block } from "./Block";
import { m } from "framer-motion";

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

const buildBlockListVariants = (count) => ({
    hidden: {},
    visible: {
        transition: {
            staggerChildren: Math.min(0.03, 0.4 / Math.max(count, 1)),
        },
    },
});

const getTime = (dateStr) => {
    if (dateStr.includes('T')) {
        const timePart = dateStr.split('T')[1];
        const [hours, minutes] = timePart.split(':').map(Number);
        return hours * 60 + (minutes || 0);
    }
    return 0;
};

const DayColumn = ({ index, dayKey, dayLabel, dayNumber, isToday, dayItems, blockProps, onBlockClick, onAddBlock, day }) => {
    const blockListVariants = useMemo(
        () => buildBlockListVariants(dayItems.length),
        [dayItems.length]
    );

    return (
        <m.div
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
                {dayLabel}
                <div className="text-[10px] md:text-xs font-black mt-0.5">
                    {dayNumber}
                </div>
            </div>
            <m.ul
                className="space-y-1"
                variants={blockListVariants}
                initial="hidden"
                animate="visible"
            >
                {dayItems.map(item => (
                    <Block
                        key={item.date + item.name}
                        item={item}
                        variant="week"
                        {...blockProps}
                        onClick={onBlockClick}
                    />
                ))}
            </m.ul>
            {onAddBlock && (
                <m.button
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
                </m.button>
            )}
        </m.div>
    );
};

export const WeekView = ({
    currentDate,
    data = [],
    blockProps = {},
    onBlockClick,
    onAddBlock
}) => {
    const weekData = useMemo(() => {
        if (!currentDate) return { weekDays: [], grouped: {} };

        const baseDate = currentDate instanceof Date ? currentDate : new Date(currentDate);
        const weekStart = startOfWeek(baseDate, { weekStartsOn: 0 });
        const weekEnd = addDays(weekStart, 6);

        const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

        const grouped = {};
        weekDays.forEach(day => {
            const items = data.filter(item => {
                const itemDate = new Date(item.date);
                return isSameDay(itemDate, day);
            });
            grouped[format(day, 'yyyy-MM-dd')] = items
                .slice()
                .sort((a, b) => getTime(a.date) - getTime(b.date));
        });

        return { weekDays, grouped };
    }, [currentDate, data]);

    const today = new Date();

    return (
        <div className="overflow-x-auto">
            <div className="rounded-sm p-1">
                <div className="flex gap-1 w-full">
                    {weekData.weekDays.map((day, index) => {
                        const dayKey = format(day, 'yyyy-MM-dd');
                        const dayItems = weekData.grouped[dayKey] || [];
                        const isToday = isSameDay(day, today);
                        return (
                            <DayColumn
                                key={dayKey}
                                index={index}
                                dayKey={dayKey}
                                dayLabel={format(day, 'EEEEE')}
                                dayNumber={format(day, 'd')}
                                isToday={isToday}
                                dayItems={dayItems}
                                blockProps={blockProps}
                                onBlockClick={onBlockClick}
                                onAddBlock={onAddBlock}
                                day={day}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
