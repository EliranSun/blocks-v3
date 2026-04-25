import { useMemo } from "react";
import { format, startOfWeek, eachDayOfInterval, isSameDay } from "date-fns";
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

export const WeekView = ({ currentDate,
    data = [],
    blockProps = {},
    onBlockClick,
    onAddBlock }) => {
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

    return (
        <div>
            <div className="grid grid-cols-7 gap-1 w-full overflow-x-auto">
                {weekData.weekDays?.map((day, index) => {
                    const dayKey = format(day, 'yyyy-MM-dd');
                    const dayItems = weekData.grouped[dayKey] || [];
                    return (
                        <motion.div
                            key={dayKey}
                            className="flex-1 brut-border bg-(--color-brut-paper) p-1.5"
                            custom={index}
                            variants={dayColumnVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <div className="text-xs mb-2 text-center pb-1 brut-label border-b-2 border-(--brut-border)">
                                {format(day, 'EEE')}
                                <br />
                                <span className="opacity-70">{format(day, 'd/MM')}</span>
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
                                    whileHover={{ x: -1, y: -1 }}
                                    whileTap={{ x: 1, y: 1 }}
                                    onClick={() => onAddBlock(day)}
                                    className="w-full mt-2 py-0.5 text-xs font-bold border-2 border-dashed border-(--brut-border) opacity-60 hover:opacity-100 hover:bg-(--color-brut-yellow)"
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
    );
};
