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

const viewOptions = [
    { key: "list", icon: "📃", label: "List" },
    { key: "year", icon: "📅", label: "Year" },
    { key: "week", icon: "7️⃣", label: "Week" },
];

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
            <RectangleButton
                isActive={isOpen || isActive}
                onClick={() => setIsOpen(!isOpen)}
            >
                {label}
            </RectangleButton>
            {isOpen && (
                <div className={classNames(
                    "absolute top-full left-0 mt-1 z-40",
                    "bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700",
                    "shadow-lg p-2 space-y-1 min-w-40"
                )}>
                    {children}
                </div>
            )}
        </div>
    );
};

const PopoverItem = ({ icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={classNames(
            "flex items-center gap-2 w-full px-2 py-1.5 text-sm text-left rounded",
            isActive ? "bg-neutral-200 dark:bg-neutral-600" : "hover:bg-neutral-100 dark:hover:bg-neutral-700"
        )}
    >
        <span>{icon}</span> <span>{label}</span>
    </button>
);

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
            <div className="flex gap-2 items-start">
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
                <ToolbarPopover
                    label={<span className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                        </svg>
                        {[showDate, showNote, showColorOnly, showSubcategory].filter(Boolean).length > 0 && (
                            <span className="text-xs">{[showDate, showNote, showColorOnly, showSubcategory].filter(Boolean).length}</span>
                        )}
                    </span>}
                    isActive={[showDate, showNote, showColorOnly, showSubcategory].some(Boolean)}
                >
                    <PopoverItem icon="📆" label="Dates" isActive={showDate} onClick={() => setShowDate(!showDate)} />
                    <PopoverItem icon="📒" label="Notes" isActive={showNote} onClick={() => setShowNote(!showNote)} />
                    <PopoverItem icon="🦄" label="Color only" isActive={showColorOnly} onClick={() => setShowColorOnly(!showColorOnly)} />
                    <PopoverItem icon="📁" label="Subcategory" isActive={showSubcategory} onClick={() => setShowSubcategory(!showSubcategory)} />
                </ToolbarPopover>
            </div>
            <div className="space-grotesk-400">
                {renderView()}
            </div>
        </div>
    )
}