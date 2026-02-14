import { WeekView } from "./WeekView";
import { YearView } from "./YearView";
import { Block } from "./Block";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from './Search';
import { RectangleButton, Button } from "./Button";
import { format } from "date-fns";
import { Categories, MonthNotes } from './constants';
import classNames from "classnames";

const categoryList = Object.values(Categories);

const DisplayOptionsPopover = ({ showDate, setShowDate, showNote, setShowNote, showColorOnly, setShowColorOnly, showSubcategory, setShowSubcategory }) => {
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

    const activeCount = [showDate, showNote, showColorOnly, showSubcategory].filter(Boolean).length;

    return (
        <div className="relative" ref={popoverRef}>
            <RectangleButton
                isActive={isOpen || activeCount > 0}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                    {activeCount > 0 && (
                        <span className="text-xs">{activeCount}</span>
                    )}
                </span>
            </RectangleButton>
            {isOpen && (
                <div className={classNames(
                    "absolute top-full left-0 mt-1 z-40",
                    "bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700",
                    "shadow-lg p-2 space-y-1 w-44"
                )}>
                    <button
                        onClick={() => setShowDate(!showDate)}
                        className={classNames(
                            "flex items-center gap-2 w-full px-2 py-1.5 text-sm text-left rounded",
                            showDate ? "bg-neutral-200 dark:bg-neutral-600" : "hover:bg-neutral-100 dark:hover:bg-neutral-700"
                        )}
                    >
                        <span>📆</span> <span>Dates</span>
                    </button>
                    <button
                        onClick={() => setShowNote(!showNote)}
                        className={classNames(
                            "flex items-center gap-2 w-full px-2 py-1.5 text-sm text-left rounded",
                            showNote ? "bg-neutral-200 dark:bg-neutral-600" : "hover:bg-neutral-100 dark:hover:bg-neutral-700"
                        )}
                    >
                        <span>📒</span> <span>Notes</span>
                    </button>
                    <button
                        onClick={() => setShowColorOnly(!showColorOnly)}
                        className={classNames(
                            "flex items-center gap-2 w-full px-2 py-1.5 text-sm text-left rounded",
                            showColorOnly ? "bg-neutral-200 dark:bg-neutral-600" : "hover:bg-neutral-100 dark:hover:bg-neutral-700"
                        )}
                    >
                        <span>🦄</span> <span>Color only</span>
                    </button>
                    <button
                        onClick={() => setShowSubcategory(!showSubcategory)}
                        className={classNames(
                            "flex items-center gap-2 w-full px-2 py-1.5 text-sm text-left rounded",
                            showSubcategory ? "bg-neutral-200 dark:bg-neutral-600" : "hover:bg-neutral-100 dark:hover:bg-neutral-700"
                        )}
                    >
                        <span>📁</span> <span>Subcategory</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export const BlocksList = ({
    view,
    onViewChange,
    currentDate,
    onNextDate,
    onPrevDate,
    data = [],
    onBlockClick,
    title,
    category,
    onCategoryChange,
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
        showDate: showDate,
        showNote: showNote,
        showColorOnly: showColorOnly,
        showSubcategory: showSubcategory,
    };

    const sharedProps = {
        blockProps: blockAlterProps,
        currentDate: currentDate,
        data: filteredData,
        onBlockClick: onBlockClick,
    };

    const renderView = () => {
        if (view === 'week') {
            return (
                <WeekView {...sharedProps} />
            );
        }

        if (view === 'year') {
            return (
                <YearView {...sharedProps} />
            );
        }

        return (
            <ul className={classNames('flex flex-wrap', {
                "gap-2": !showColorOnly
            })}>
                {filteredData.reverse().map(item =>
                    <Block
                        variant="list"
                        key={item.date + item.name}
                        item={item}
                        onClick={onBlockClick}
                        {...blockAlterProps}
                    />
                )}
            </ul>
        )
    }

    return (
        <div className="space-y-2">
            <div className='flex gap-4 items-center w-full'>
                <div className='flex gap-2'>
                    <Button onClick={onPrevDate}>
                        ←
                    </Button>
                    <Button onClick={onNextDate}>
                        →
                    </Button>
                </div>
                <div className='spacy-y-4'>
                    <h1 className='text-2xl merriweather-900'>
                        {title}
                    </h1>
                    <h2 className='text-gray-400 text-xs'>
                        {MonthNotes[format(currentDate, 'yyyy-MM')]}
                    </h2>
                </div>
            </div>
            <Search
                value={searchTerm}
                autoHide={false}
                onInputChange={input => {
                    setSearchTerm(input);
                    if (input.length > 0) onViewChange("list");
                }} />
            <div className="flex gap-2 flex-wrap items-start">
                <div className="flex gap-1 p-1 rounded-none bg-neutral-100 dark:bg-neutral-800/60">
                    <RectangleButton
                        isActive={view === "list"}
                        onClick={() => onViewChange("list")}
                    >
                        📃
                    </RectangleButton>
                    <RectangleButton
                        isActive={view === "year"}
                        onClick={() => onViewChange("year")}
                    >
                        📅
                    </RectangleButton>
                    <RectangleButton
                        isActive={view === "week"}
                        onClick={() => onViewChange("week")}
                    >
                        7️⃣
                    </RectangleButton>
                </div>
                <div className="flex gap-1 p-1 rounded-none bg-neutral-100 dark:bg-neutral-800/60">
                    <RectangleButton
                        isActive={!category}
                        onClick={() => onCategoryChange(null)}
                    >
                        All
                    </RectangleButton>
                    {categoryList.map(({ name, icon, color }) => (
                        <button
                            key={name}
                            title={name}
                            onClick={() => onCategoryChange(category === name ? null : name)}
                            className={classNames(
                                "px-1.5 py-1.5 text-sm transition-colors rounded-none",
                                category === name
                                    ? "bg-neutral-800 shadow-md ring-2 ring-neutral-600"
                                    : "hover:bg-neutral-200 dark:hover:bg-neutral-700/60",
                            )}
                        >
                            <span className={classNames(
                                "text-base",
                                category && category !== name && "opacity-30"
                            )}>
                                {icon}
                            </span>
                        </button>
                    ))}
                </div>
                <DisplayOptionsPopover
                    showDate={showDate}
                    setShowDate={setShowDate}
                    showNote={showNote}
                    setShowNote={setShowNote}
                    showColorOnly={showColorOnly}
                    setShowColorOnly={setShowColorOnly}
                    showSubcategory={showSubcategory}
                    setShowSubcategory={setShowSubcategory}
                />
            </div>
            <div className="space-grotesk-400">
                {renderView()}
            </div>
        </div>
    )
}