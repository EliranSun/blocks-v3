import { useMemo, useRef } from "react";
import { format, startOfYear, eachMonthOfInterval, isSameMonth } from "date-fns";
import classNames from "classnames";
import { Block } from "./Block";
import { m } from "framer-motion";
import { useVirtualizer } from "@tanstack/react-virtual";

const monthCardVariants = {
    hidden: { opacity: 0, scale: 0.92, y: 12 },
    visible: (i) => ({
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            delay: i * 0.04,
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
            staggerChildren: Math.min(0.02, 0.4 / Math.max(count, 1)),
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

const sortMonthItems = (items) =>
    items.slice().sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        if (dateA.getDate() !== dateB.getDate()) {
            return dateA.getDate() - dateB.getDate();
        }
        return getTime(a.date) - getTime(b.date);
    });

const MonthCard = ({ index, monthLabel, monthItems, isCurrentMonth, blockProps, onBlockClick }) => {
    const parentRef = useRef(null);
    const rowVirtualizer = useVirtualizer({
        count: monthItems.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 22,
        overscan: 4,
    });

    const blockListVariants = useMemo(
        () => buildBlockListVariants(monthItems.length),
        [monthItems.length]
    );

    return (
        <m.div
            className="border-2 md:border-[3px] border-black dark:border-white rounded-sm bg-[#fffbe6] dark:bg-neutral-900 shadow-[2px_2px_0_0_#000] md:shadow-[4px_4px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff] dark:md:shadow-[4px_4px_0_0_#fff] flex flex-col p-2 h-[20vh] overflow-hidden"
            custom={index}
            variants={monthCardVariants}
            initial="hidden"
            animate="visible"
        >
            <div
                className={classNames(
                    "text-center pb-1 mb-1 border-b-2 border-black dark:border-white shrink-0",
                    "font-black uppercase tracking-tight space-grotesk-600 text-xs",
                    isCurrentMonth ? "bg-black text-white dark:bg-white dark:text-black px-1" : "text-black dark:text-white"
                )}
            >
                {monthLabel}
            </div>
            <div ref={parentRef} className="flex-1 min-h-0 overflow-hidden relative">
                <m.ol
                    className="list-none"
                    style={{
                        height: rowVirtualizer.getTotalSize(),
                        position: 'relative',
                        width: '100%',
                    }}
                    variants={blockListVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {rowVirtualizer.getVirtualItems().map(virtualRow => {
                        const item = monthItems[virtualRow.index];
                        return (
                            <div
                                key={item.date + item.name}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    transform: `translateY(${virtualRow.start}px)`,
                                    paddingBottom: 4,
                                }}
                            >
                                <Block
                                    item={item}
                                    {...blockProps}
                                    variant="year"
                                    onClick={onBlockClick}
                                />
                            </div>
                        );
                    })}
                </m.ol>
            </div>
        </m.div>
    );
};

export const YearView = ({ currentDate, data = [], blockProps = {}, onBlockClick }) => {
    const yearData = useMemo(() => {
        if (!currentDate) return { yearMonths: [], grouped: {} };

        const baseDate = currentDate instanceof Date ? currentDate : new Date(currentDate);
        const yearStart = startOfYear(baseDate);
        const yearEnd = new Date(yearStart);
        yearEnd.setFullYear(yearEnd.getFullYear() + 1);
        yearEnd.setMonth(0);
        yearEnd.setDate(0);

        const yearMonths = eachMonthOfInterval({ start: yearStart, end: yearEnd });

        const grouped = {};
        yearMonths.forEach(month => {
            const items = data.filter(item => {
                const itemDate = new Date(item.date);
                return isSameMonth(itemDate, month);
            });
            grouped[format(month, 'yyyy-MM')] = sortMonthItems(items);
        });

        return { yearMonths, grouped };
    }, [currentDate, data]);

    const today = new Date();

    return (
        <div className="space-grotesk-400">
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 w-full">
                {yearData.yearMonths.map((month, index) => {
                    const monthKey = format(month, 'yyyy-MM');
                    const monthItems = yearData.grouped[monthKey] || [];
                    const isCurrentMonth = isSameMonth(month, today);
                    return (
                        <MonthCard
                            key={monthKey}
                            index={index}
                            monthLabel={format(month, 'MMM')}
                            monthItems={monthItems}
                            isCurrentMonth={isCurrentMonth}
                            blockProps={blockProps}
                            onBlockClick={onBlockClick}
                        />
                    );
                })}
            </div>
        </div>
    );
};
