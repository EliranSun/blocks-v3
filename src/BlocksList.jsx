import { WeekView } from "./WeekView";
import { YearView } from "./YearView";
import { Block } from "./Block";
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { Search } from './Search';
import { Button } from "./Button";
import { format } from "date-fns";
import { MonthNotes } from './constants';
import classNames from "classnames";
import { m, AnimatePresence } from "framer-motion";

const categoryList = Object.values(Categories);

const viewOptions = [
    { key: "list", icon: "📃", label: "List" },
    { key: "year", icon: "📅", label: "Year" },
    { key: "week", icon: "7️⃣", label: "Week" },
];

const dropdownVariants = {
    hidden: {
        opacity: 0,
        scale: 0.92,
        y: -4,
    },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            type: "spring",
            damping: 22,
            stiffness: 400,
            staggerChildren: 0.03,
        },
    },
    exit: {
        opacity: 0,
        scale: 0.95,
        y: -4,
        transition: { duration: 0.12 },
    },
};

const dropdownItemVariants = {
    hidden: { opacity: 0, x: -6 },
    visible: { opacity: 1, x: 0 },
};

const buildListContainerVariants = (count) => ({
    hidden: {},
    visible: {
        transition: {
            staggerChildren: Math.min(0.025, 0.5 / Math.max(count, 1)),
        },
    },
});

const ToolbarPopover = ({ label, isActive, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const popoverRef = useRef(null);

    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = () => setIsOpen(false);
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    return (
        <div className="relative" ref={popoverRef}>
            <m.button
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
                <m.span
                    className="text-[10px]"
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                    ▾
                </m.span>
            </m.button>
            <AnimatePresence>
                {isOpen && (
                    <m.div
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
                    </m.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const PopoverItem = ({ icon, label, isActive, onClick }) => (
    <m.button
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
    </m.button>
);

const listScopeOptions = [
    { key: "all", label: "All" },
    { key: "year", label: "Year" },
    { key: "month", label: "Month" },
    { key: "week", label: "Week" },
];

export const BlocksList = ({
    view,
    onViewChange,
    currentDate,
    onNextDate,
    onPrevDate,
    data = [],
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
    const deferredSearch = useDeferredValue(searchTerm);

    const toggles = {
        showDate,
        showNote,
        showColorOnly,
        showSubcategory,
    };

    const handleToggle = (key) => {
        if (key === "showDate") setShowDate(v => !v);
        else if (key === "showNote") setShowNote(v => !v);
        else if (key === "showColorOnly") setShowColorOnly(v => !v);
        else if (key === "showSubcategory") setShowSubcategory(v => !v);
    };

    const filteredData = useMemo(() => {
        const search = deferredSearch.trim();
        if (!search) {
            return data.slice().reverse();
        }
        const regex = new RegExp(search, 'i');
        return data
            .filter(item =>
                regex.test(item.name) ||
                regex.test(item.category) ||
                regex.test(item.subcategory) ||
                regex.test(item.location) ||
                regex.test(item.note)
            )
            .reverse();
    }, [data, deferredSearch]);

    const blockAlterProps = useMemo(() => ({
        showDate,
        showNote,
        showColorOnly,
        showSubcategory,
    }), [showDate, showNote, showColorOnly, showSubcategory]);

    const sharedProps = {
        blockProps: blockAlterProps,
        currentDate: currentDate,
        data: filteredData,
        onBlockClick: onBlockClick,
    };

    const listContainerVariants = useMemo(
        () => buildListContainerVariants(filteredData.length),
        [filteredData.length]
    );

    const toggleShowDate = useCallback(() => setShowDate(v => !v), []);
    const toggleShowNote = useCallback(() => setShowNote(v => !v), []);
    const toggleShowColorOnly = useCallback(() => setShowColorOnly(v => !v), []);
    const toggleShowSubcategory = useCallback(() => setShowSubcategory(v => !v), []);

    const handleSearchChange = useCallback((input) => {
        setSearchTerm(input);
        if (input.length > 0) onViewChange("list");
    }, [onViewChange]);

    const renderView = () => {
        if (view === 'week') {
            return (
                <WeekView {...sharedProps} onAddBlock={onAddBlock} />
            );
        }

        if (view === 'year') {
            return (
                <YearView {...sharedProps} />
            );
        }

        return (
            <m.ul
                className={classNames('flex flex-wrap', {
                    "gap-2": !showColorOnly
                })}
                variants={listContainerVariants}
                initial="hidden"
                animate="visible"
            >
                {filteredData.map(item =>
                    <Block
                        variant="list"
                        key={item.date + item.name}
                        item={item}
                        onClick={onBlockClick}
                        {...blockAlterProps}
                    />
                )}
            </m.ul>
        )
    }

    const showNavigation = view !== 'list' || listScope !== 'all';

    return (
        <div className="space-y-2">
            <div className='flex gap-4 items-center w-full'>
                {showNavigation && (
                    <div className='flex gap-2'>
                        <Button onClick={onPrevDate}>
                            ←
                        </Button>
                        <Button onClick={onNextDate}>
                            →
                        </Button>
                    </div>
                )}
                <div className='spacy-y-4'>
                    <m.h1
                        className='text-2xl merriweather-900'
                        key={title}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: "spring", damping: 20, stiffness: 300 }}
                    >
                        {title}
                    </m.h1>
                    <h2 className='text-gray-400 text-xs'>
                        {MonthNotes[format(currentDate, 'yyyy-MM')]}
                    </h2>
                </div>
            </div>
            {view === 'list' && (
                <div className="flex gap-1 p-1 rounded-md bg-neutral-100 dark:bg-neutral-800/60">
                    {listScopeOptions.map(({ key, label }) => (
                        <m.button
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
                        </m.button>
                    ))}
                </div>
            )}
            <Search
                value={searchTerm}
                autoHide={false}
                onInputChange={handleSearchChange} />
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
                        isActive={!!category}
                        label={category
                            ? categoryList.find(c => c.name === category)?.icon
                            : "All"
                        }
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
                    <RectangleButton
                        isActive={showDate}
                        onClick={toggleShowDate}>
                        📆
                    </RectangleButton>
                    <RectangleButton
                        isActive={showNote}
                        onClick={toggleShowNote}>
                        📒
                    </RectangleButton>
                    <RectangleButton
                        isActive={showColorOnly}
                        onClick={toggleShowColorOnly}>
                        🦄
                    </RectangleButton>
                    <RectangleButton
                        isActive={showSubcategory}
                        onClick={toggleShowSubcategory}>
                        📁
                    </RectangleButton>
                </div>
            </div>
            <AnimatePresence>
                <m.div
                    key={view}
                    className="space-grotesk-400"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                >
                    {renderView()}
                </m.div>
            </AnimatePresence>
        </div>
    )
}
