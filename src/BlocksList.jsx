import { WeekView } from "./WeekView";
import { YearView } from "./YearView";
import { Block } from "./Block";
import { useMemo, useRef, useState, useEffect } from "react";
import { RectangleButton, Button } from "./Button";
import { format } from "date-fns";
import { Categories, MonthNotes } from './constants';
import { CompletionCard, TopMoodCard } from "./WeekSummaryCards";
import classNames from "classnames";
import { motion, AnimatePresence } from "framer-motion";

const categoryList = Object.values(Categories);

const viewOptions = [
    { key: "list", icon: "📃", label: "List" },
    { key: "year", icon: "📅", label: "Year" },
    { key: "week", icon: "7️⃣", label: "Week" },
];

const dropdownVariants = {
    hidden: { opacity: 0, scale: 0.92, y: -4 },
    visible: {
        opacity: 1, scale: 1, y: 0,
        transition: { type: "spring", damping: 22, stiffness: 400, staggerChildren: 0.03 },
    },
    exit: { opacity: 0, scale: 0.95, y: -4, transition: { duration: 0.12 } },
};

const dropdownItemVariants = {
    hidden: { opacity: 0, x: -6 },
    visible: { opacity: 1, x: 0 },
};

const listContainerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.025 } },
};

const ToolbarPopover = ({ label, isActive, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const popoverRef = useRef(null);

    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (e) => {
            if (popoverRef.current && !popoverRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    return (
        <div className="relative" ref={popoverRef}>
            <motion.button
                whileTap={{ scale: 0.93 }}
                whileHover={{ scale: 1.04 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
                onClick={() => setIsOpen(!isOpen)}
                className={classNames(
                    "px-3 py-1.5 text-sm font-semibold transition-colors",
                    "border border-neutral-300 dark:border-neutral-600 rounded-md",
                    "flex items-center gap-1.5",
                    isOpen || isActive
                        ? "bg-neutral-800 text-white border-neutral-600"
                        : "bg-white text-neutral-700 hover:bg-neutral-50 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700",
                )}
            >
                {label}
                <motion.span
                    className="text-[10px]"
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                    ▾
                </motion.span>
            </motion.button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        variants={dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className={classNames(
                            "absolute top-full left-0 mt-1 z-40",
                            "bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700",
                            "shadow-lg rounded-md p-2 space-y-1 min-w-40"
                        )}
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const PopoverItem = ({ icon, label, isActive, onClick }) => (
    <motion.button
        variants={dropdownItemVariants}
        whileHover={{ x: 3, backgroundColor: "rgba(128,128,128,0.08)" }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        onClick={onClick}
        className={classNames(
            "flex items-center gap-2 w-full px-2 py-1.5 text-sm text-left rounded-md",
            isActive ? "bg-neutral-200 dark:bg-neutral-600" : ""
        )}
    >
        <span>{icon}</span> <span>{label}</span>
    </motion.button>
);

const listScopeOptions = [
    { key: "all", label: "All" },
    { key: "year", label: "Year" },
    { key: "month", label: "Month" },
    { key: "week", label: "Week" },
];

const SearchIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

export const BlocksList = ({
    view,
    onViewChange,
    currentDate,
    onNextDate,
    onPrevDate,
    data = [],
    allLogs = [],
    onBlockClick,
    onAddBlock,
    title,
    category,
    onCategoryChange,
    listScope = "all",
    onListScopeChange,
}) => {
    const [showDate, setShowDate] = useState(false);
    const [showColorOnly, setShowColorOnly] = useState(false);
    const [showNote, setShowNote] = useState(false);
    const [showSubcategory, setShowSubcategory] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const filteredData = useMemo(() => {
        if (searchTerm) {
            return data.filter(item => {
                const search = searchTerm.trim();
                const regex = new RegExp(search, 'i');
                return (
                    regex.test(item.name) ||
                    regex.test(item.category) ||
                    regex.test(item.subcategory) ||
                    regex.test(item.location) ||
                    regex.test(item.note)
                );
            });
        }
        return data;
    }, [data, searchTerm]);

    const blockAlterProps = {
        showDate,
        showNote,
        showColorOnly,
        showSubcategory,
    };

    const sharedProps = {
        blockProps: blockAlterProps,
        currentDate,
        data: filteredData,
        onBlockClick,
    };

    const isWeekView = view === 'week';

    const renderView = () => {
        if (isWeekView) {
            return (
                <>
                    <WeekView {...sharedProps} onAddBlock={onAddBlock} />
                    <div className="space-y-3 mt-6">
                        <CompletionCard
                            weekData={filteredData}
                            allLogs={allLogs}
                            currentDate={currentDate}
                        />
                        <TopMoodCard weekData={filteredData} />
                    </div>
                </>
            );
        }

        if (view === 'year') {
            return <YearView {...sharedProps} />;
        }

        return (
            <motion.ul
                className={classNames('flex flex-wrap', { "gap-2": !showColorOnly })}
                variants={listContainerVariants}
                initial="hidden"
                animate="visible"
                key={`list-${filteredData.length}-${searchTerm}`}
            >
                {filteredData.reverse().map(item =>
                    <Block
                        variant="list"
                        key={item.date + item.name}
                        item={item}
                        onClick={onBlockClick}
                        {...blockAlterProps}
                    />
                )}
            </motion.ul>
        );
    };

    const showNavigation = view !== 'list' || listScope !== 'all';

    return (
        <div className="space-y-3">
            {/* Header */}
            {isWeekView ? (
                <>
                    {/* Week view header: search icon, centered nav, avatar */}
                    <div className="flex items-center justify-between">
                        <button className="text-neutral-400 hover:text-white transition-colors p-1">
                            <SearchIcon />
                        </button>
                        <div className="flex items-center gap-3">
                            <motion.button
                                whileTap={{ scale: 0.88 }}
                                onClick={onPrevDate}
                                className="text-neutral-400 hover:text-white transition-colors"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="15 18 9 12 15 6" />
                                </svg>
                            </motion.button>
                            <motion.h1
                                className="text-lg font-bold text-white"
                                key={title}
                                initial={{ opacity: 0, y: -6 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                            >
                                {title}
                            </motion.h1>
                            <motion.button
                                whileTap={{ scale: 0.88 }}
                                onClick={onNextDate}
                                className="text-neutral-400 hover:text-white transition-colors"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="9 18 15 12 9 6" />
                                </svg>
                            </motion.button>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center">
                            <span className="text-xs">👤</span>
                        </div>
                    </div>

                    {/* Search bar */}
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
                            <SearchIcon />
                        </span>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                if (e.target.value.length > 0) onViewChange("list");
                            }}
                            placeholder="Search habits or mood..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-600"
                        />
                    </div>

                    {/* Category filter pills */}
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onCategoryChange(null)}
                            className={classNames(
                                "px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                                !category
                                    ? "bg-blue-600 text-white"
                                    : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
                            )}
                        >
                            All
                        </motion.button>
                        {categoryList.map(({ name, icon }) => (
                            <motion.button
                                key={name}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => onCategoryChange(category === name ? null : name)}
                                className={classNames(
                                    "px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                                    category === name
                                        ? "bg-blue-600 text-white"
                                        : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
                                )}
                            >
                                {name.charAt(0).toUpperCase() + name.slice(1)}
                            </motion.button>
                        ))}
                    </div>
                </>
            ) : (
                <>
                    {/* Non-week header (original style) */}
                    <div className="flex gap-4 items-center w-full">
                        {showNavigation && (
                            <div className="flex gap-2">
                                <Button onClick={onPrevDate}>←</Button>
                                <Button onClick={onNextDate}>→</Button>
                            </div>
                        )}
                        <div className="spacy-y-4">
                            <motion.h1
                                className="text-2xl merriweather-900"
                                key={title}
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                            >
                                {title}
                            </motion.h1>
                            <h2 className="text-gray-400 text-xs">
                                {MonthNotes[format(currentDate, 'yyyy-MM')]}
                            </h2>
                        </div>
                    </div>

                    {view === 'list' && (
                        <div className="flex gap-1 p-1 rounded-md bg-neutral-100 dark:bg-neutral-800/60">
                            {listScopeOptions.map(({ key, label }) => (
                                <motion.button
                                    key={key}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => onListScopeChange(key)}
                                    className={classNames(
                                        "px-3 py-1 text-xs font-medium rounded-md transition-colors",
                                        listScope === key
                                            ? "bg-neutral-800 text-white dark:bg-neutral-200 dark:text-neutral-900"
                                            : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                                    )}
                                >
                                    {label}
                                </motion.button>
                            ))}
                        </div>
                    )}

                    {/* Search for non-week views */}
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
                            <SearchIcon />
                        </span>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                if (e.target.value.length > 0) onViewChange("list");
                            }}
                            placeholder="Search..."
                            className="w-full pl-10 pr-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400"
                        />
                    </div>

                    {/* Toolbar (non-week views) */}
                    <div className="flex gap-2 items-center">
                        <div className="flex gap-2 items-center">
                            <ToolbarPopover
                                label={viewOptions.find(v => v.key === view)?.icon || "📃"}
                                isActive={false}
                            >
                                {viewOptions.map(({ key, icon, label }) => (
                                    <PopoverItem
                                        key={key}
                                        icon={icon}
                                        label={label}
                                        isActive={view === key}
                                        onClick={() => onViewChange(key)}
                                    />
                                ))}
                            </ToolbarPopover>
                            <ToolbarPopover
                                label={category
                                    ? categoryList.find(c => c.name === category)?.icon
                                    : "All"
                                }
                                isActive={!!category}
                            >
                                <PopoverItem
                                    icon="*"
                                    label="All"
                                    isActive={!category}
                                    onClick={() => onCategoryChange(null)}
                                />
                                {categoryList.map(({ name, icon }) => (
                                    <PopoverItem
                                        key={name}
                                        icon={icon}
                                        label={name.charAt(0).toUpperCase() + name.slice(1)}
                                        isActive={category === name}
                                        onClick={() => onCategoryChange(category === name ? null : name)}
                                    />
                                ))}
                            </ToolbarPopover>
                        </div>
                        <div className="w-px h-6 bg-neutral-300 dark:bg-neutral-600 mx-1" />
                        <div className="flex gap-1 p-1 rounded-md bg-neutral-100 dark:bg-neutral-800/60">
                            <RectangleButton isActive={showDate} onClick={() => setShowDate(!showDate)}>📆</RectangleButton>
                            <RectangleButton isActive={showNote} onClick={() => setShowNote(!showNote)}>📒</RectangleButton>
                            <RectangleButton isActive={showColorOnly} onClick={() => setShowColorOnly(!showColorOnly)}>🦄</RectangleButton>
                            <RectangleButton isActive={showSubcategory} onClick={() => setShowSubcategory(!showSubcategory)}>📁</RectangleButton>
                        </div>
                    </div>
                </>
            )}

            <AnimatePresence mode="wait">
                <motion.div
                    key={view}
                    className="space-grotesk-400"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                >
                    {renderView()}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};
