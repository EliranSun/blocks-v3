import { Fragment, useEffect, useMemo, useState } from "react";
import { format, getDaysInMonth, isSameDay } from "date-fns";
import classNames from "classnames";
import { motion, m } from "framer-motion";
import { ChevronLeft, ChevronRight, Layers } from "lucide-react";
import { Popover } from "./Popover";
import { Categories, CategoryBgColors } from "./constants";
import { CategoryModal, ModalShell, Tile } from "./BlocksToolbar";

const MONTH_LETTERS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

const NEO_TRIGGER = classNames(
    "select-none cursor-pointer rounded-sm",
    "border-[3px] border-black dark:border-white",
    "shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff]",
    "active:shadow-[1px_1px_0_0_#000] dark:active:shadow-[1px_1px_0_0_#fff]",
    "active:translate-x-[3px] active:translate-y-[3px]",
    "transition-[transform,box-shadow] duration-75",
    "flex items-center justify-center gap-2 px-3 py-2",
    "font-black uppercase tracking-tight space-grotesk-600 text-sm",
);

const cellAnimation = {
    hidden: { opacity: 0, scale: 0.6 },
    visible: { opacity: 1, scale: 1, transition: { type: "spring", damping: 22, stiffness: 320 } },
};

const containerStagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.001 } },
};

const STRIPED_BG =
    "bg-[repeating-linear-gradient(45deg,#d4d4d4_0_2px,#fafafa_2px_6px)] " +
    "dark:bg-[repeating-linear-gradient(45deg,#525252_0_2px,#171717_2px_6px)]";

const CELL_SIZE = "clamp(12px, calc((100dvh - 14rem) / 31), 40px)";

const BlockFilterModal = ({ isOpen, onClose, categoryName, block, onBlockChange }) => {
    const cat = categoryName
        ? Object.values(Categories).find((c) => c.name === categoryName)
        : null;
    const blocks = cat?.blocks ?? [];
    return (
        <Popover isOpen={isOpen}>
            <ModalShell title={cat ? `${cat.name} block` : "Block"} onClose={onClose}>
                <div className="flex flex-col gap-3">
                    <Tile
                        active={!block}
                        ariaCurrent={!block ? "true" : undefined}
                        onClick={() => {
                            onBlockChange(null);
                            onClose();
                        }}
                    >
                        <span className="flex items-center gap-3">
                            <span className="text-2xl leading-none">*</span>
                            <span>All</span>
                        </span>
                        {!block && (
                            <span className="text-[10px] tracking-widest font-bold border-[2px] border-black px-2 py-1 rounded-sm">
                                CURRENT
                            </span>
                        )}
                    </Tile>
                    {blocks.map((blockName) => {
                        const active = block === blockName;
                        return (
                            <Tile
                                key={blockName}
                                active={active}
                                ariaCurrent={active ? "true" : undefined}
                                onClick={() => {
                                    onBlockChange(active ? null : blockName);
                                    onClose();
                                }}
                            >
                                <span className="flex items-center gap-3">
                                    <span>{blockName}</span>
                                </span>
                                {active && (
                                    <span className="text-[10px] tracking-widest font-bold border-[2px] border-black px-2 py-1 rounded-sm">
                                        CURRENT
                                    </span>
                                )}
                            </Tile>
                        );
                    })}
                </div>
            </ModalShell>
        </Popover>
    );
};

const dominantCategory = (byCategory) => {
    let best = null;
    for (const [name, info] of Object.entries(byCategory)) {
        if (
            !best ||
            info.count > best.count ||
            (info.count === best.count && info.latest > best.latest)
        ) {
            best = { name, count: info.count, latest: info.latest };
        }
    }
    return best?.name ?? null;
};

export const YearPixelView = ({
    currentDate,
    data = [],
    category,
    onCategoryChange,
    onNextYear,
    onPrevYear,
}) => {
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [isBlockOpen, setIsBlockOpen] = useState(false);
    const [block, setBlock] = useState(null);
    const [tooltip, setTooltip] = useState(null);

    useEffect(() => {
        setBlock(null);
    }, [category]);

    const year = currentDate.getFullYear();
    const today = new Date();

    const dayMap = useMemo(() => {
        const map = {};
        for (const item of data) {
            const d = new Date(item.date);
            if (d.getFullYear() !== year) continue;
            const monthIdx = d.getMonth();
            const day = d.getDate();
            const key = `${monthIdx}-${day}`;
            const ts = d.getTime();
            if (!map[key]) map[key] = { items: [], byCategory: {} };
            map[key].items.push(item);
            const cat = (item.category || "").toLowerCase();
            if (!cat) continue;
            if (!map[key].byCategory[cat]) {
                map[key].byCategory[cat] = { count: 0, latest: 0 };
            }
            map[key].byCategory[cat].count += 1;
            if (ts > map[key].byCategory[cat].latest) {
                map[key].byCategory[cat].latest = ts;
            }
        }
        return map;
    }, [data, year]);

    const daysInMonthCache = useMemo(
        () => MONTH_LETTERS.map((_, monthIdx) => getDaysInMonth(new Date(year, monthIdx, 1))),
        [year],
    );

    const activeCategory = category
        ? Object.values(Categories).find((c) => c.name === category)
        : null;
    const ActiveCatIcon = activeCategory?.icon ?? null;

    useEffect(() => {
        if (!tooltip) return;
        const onKey = (e) => {
            if (e.key === "Escape") setTooltip(null);
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [tooltip]);

    const handleCellClick = (event, cellDate, items) => {
        event.stopPropagation();
        if (!items || items.length === 0) {
            setTooltip(null);
            return;
        }
        const rect = event.currentTarget.getBoundingClientRect();
        setTooltip({
            day: cellDate,
            items,
            anchorX: rect.left + rect.width / 2,
            anchorY: rect.top,
        });
    };

    return (
        <div
            className="space-grotesk-400 flex flex-col gap-4 h-[calc(100dvh-8rem)]"
            onClick={() => setTooltip(null)}
        >
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                    <motion.button
                        type="button"
                        whileHover={{ translateX: -1, translateY: -1 }}
                        onClick={onPrevYear}
                        aria-label="Previous year"
                        className={classNames(
                            NEO_TRIGGER,
                            "bg-white text-black dark:bg-neutral-800 dark:text-white w-11 h-11 px-0",
                        )}
                    >
                        <ChevronLeft size={18} strokeWidth={3} />
                    </motion.button>
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight space-grotesk-600 leading-none">
                        {year}
                    </h2>
                    <motion.button
                        type="button"
                        whileHover={{ translateX: -1, translateY: -1 }}
                        onClick={onNextYear}
                        aria-label="Next year"
                        className={classNames(
                            NEO_TRIGGER,
                            "bg-white text-black dark:bg-neutral-800 dark:text-white w-11 h-11 px-0",
                        )}
                    >
                        <ChevronRight size={18} strokeWidth={3} />
                    </motion.button>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    <motion.button
                        type="button"
                        whileHover={{ translateX: -1, translateY: -1 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsCategoryOpen(true);
                        }}
                        className={classNames(
                            NEO_TRIGGER,
                            category
                                ? `${activeCategory.bgColor} text-black`
                                : "bg-white text-black dark:bg-neutral-800 dark:text-white",
                        )}
                    >
                        {ActiveCatIcon ? (
                            <ActiveCatIcon size={18} strokeWidth={2.5} />
                        ) : (
                            <span>*</span>
                        )}
                        <span>{activeCategory?.name ?? "All"}</span>
                    </motion.button>
                    {category && (
                        <motion.button
                            type="button"
                            whileHover={{ translateX: -1, translateY: -1 }}
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsBlockOpen(true);
                            }}
                            className={classNames(
                                NEO_TRIGGER,
                                block
                                    ? "bg-amber-400 text-black"
                                    : "bg-white text-black dark:bg-neutral-800 dark:text-white",
                            )}
                        >
                            <Layers size={18} strokeWidth={2.5} />
                            <span>{block ?? "All blocks"}</span>
                        </motion.button>
                    )}
                </div>
            </div>
            <div
                className={classNames(
                    "flex-1 min-h-0 flex items-start justify-center overflow-hidden",
                )}
            >
                <div
                    className={classNames(
                        "rounded-sm bg-black dark:bg-white p-[2px] inline-block",
                        "border-[3px] border-black dark:border-white",
                        "shadow-[5px_5px_0_0_#000] dark:shadow-[5px_5px_0_0_#fff]",
                    )}
                >
                    <m.div
                        variants={containerStagger}
                        initial="hidden"
                        animate="visible"
                        className="grid gap-[2px]"
                        style={{
                            gridTemplateColumns: `1.5rem repeat(12, ${CELL_SIZE})`,
                            gridTemplateRows: `1rem repeat(31, ${CELL_SIZE})`,
                        }}
                    >
                        <div className="bg-white dark:bg-neutral-900" />
                        {MONTH_LETTERS.map((letter, idx) => (
                            <div
                                key={`hdr-${idx}`}
                                className="bg-white dark:bg-neutral-900 text-center text-[11px] leading-none font-black uppercase tracking-tight space-grotesk-600 text-black dark:text-white flex items-center justify-center"
                            >
                                {letter}
                            </div>
                        ))}
                        {Array.from({ length: 31 }, (_, dayIdx) => {
                            const day = dayIdx + 1;
                            return (
                                <Fragment key={`row-${day}`}>
                                    <div className="bg-white dark:bg-neutral-900 text-right text-[10px] leading-none font-black space-grotesk-600 text-black dark:text-white flex items-center justify-end pr-1">
                                        {day}
                                    </div>
                                    {MONTH_LETTERS.map((_, monthIdx) => {
                                        const exists = day <= daysInMonthCache[monthIdx];
                                        const key = `${monthIdx}-${day}`;
                                        const dayData = dayMap[key];

                                        let fillClass;
                                        if (!exists) {
                                            fillClass = STRIPED_BG;
                                        } else if (dayData) {
                                            let dominant;
                                            if (block) {
                                                const matched = dayData.items.find(
                                                    (it) => it.name?.toLowerCase() === block.toLowerCase(),
                                                );
                                                dominant = matched?.category?.toLowerCase() ?? null;
                                            } else if (category) {
                                                dominant = dayData.byCategory[category] ? category : null;
                                            } else {
                                                dominant = dominantCategory(dayData.byCategory);
                                            }
                                            fillClass = dominant
                                                ? CategoryBgColors[dominant] ?? "bg-neutral-400"
                                                : "bg-white dark:bg-neutral-900";
                                        } else {
                                            fillClass = "bg-white dark:bg-neutral-900";
                                        }

                                        const cellDate = exists ? new Date(year, monthIdx, day) : null;
                                        const isToday = cellDate && isSameDay(cellDate, today);

                                        return (
                                            <m.button
                                                key={key}
                                                type="button"
                                                variants={cellAnimation}
                                                disabled={!exists}
                                                onClick={(e) =>
                                                    exists && handleCellClick(e, cellDate, dayData?.items)
                                                }
                                                aria-label={cellDate ? format(cellDate, "MMM d") : undefined}
                                                className={classNames(
                                                    "min-w-0 min-h-0",
                                                    fillClass,
                                                    isToday && "ring-2 ring-amber-400 ring-inset z-10",
                                                    exists ? "cursor-pointer" : "cursor-default",
                                                )}
                                            />
                                        );
                                    })}
                                </Fragment>
                            );
                        })}
                    </m.div>
                </div>
            </div>
            {tooltip && (
                <div
                    className={classNames(
                        "fixed z-40 bg-white dark:bg-neutral-900 text-black dark:text-white",
                        "border-[3px] border-black dark:border-white rounded-sm",
                        "shadow-[5px_5px_0_0_#000] dark:shadow-[5px_5px_0_0_#fff]",
                        "p-3 w-56 space-grotesk-400 text-sm",
                    )}
                    style={{
                        left: Math.min(
                            Math.max(tooltip.anchorX - 112, 8),
                            (typeof window !== "undefined" ? window.innerWidth : 320) - 232,
                        ),
                        top: Math.max(tooltip.anchorY - 8, 8),
                        transform: "translateY(-100%)",
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="text-xs font-black uppercase tracking-widest space-grotesk-600 mb-2">
                        {format(tooltip.day, "MMM d, yyyy")}
                    </div>
                    <ul className="space-y-1 max-h-40 overflow-y-auto">
                        {tooltip.items.map((item, i) => (
                            <li key={item._id ?? i} className="flex items-center gap-2 text-xs">
                                <span
                                    className={classNames(
                                        "w-2.5 h-2.5 rounded-sm shrink-0 border border-black dark:border-white",
                                        CategoryBgColors[item.category?.toLowerCase()] ?? "bg-neutral-400",
                                    )}
                                />
                                <span className="font-bold truncate">{item.name}</span>
                                <span className="text-neutral-500 dark:text-neutral-400 truncate">
                                    ({item.category})
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            <CategoryModal
                isOpen={isCategoryOpen}
                onClose={() => setIsCategoryOpen(false)}
                category={category}
                onCategoryChange={onCategoryChange}
            />
            <BlockFilterModal
                isOpen={isBlockOpen}
                onClose={() => setIsBlockOpen(false)}
                categoryName={category}
                block={block}
                onBlockChange={setBlock}
            />
        </div>
    );
};
