import { WeekView } from "./WeekView";
import { YearView } from "./YearView";
import { Block } from "./Block";
import { useCallback, useDeferredValue, useMemo, useState } from "react";
import { Search } from './Search';
import { BlocksToolbar } from "./BlocksToolbar";
import { format } from "date-fns";
import { MonthNotes } from './constants';
import classNames from "classnames";
import { m, AnimatePresence } from "framer-motion";

const NEO_NAV_BUTTON = classNames(
    "shrink-0 w-11 h-11 flex items-center justify-center rounded-sm",
    "border-[3px] border-black dark:border-white",
    "bg-white text-black dark:bg-neutral-800 dark:text-white",
    "shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff]",
    "active:shadow-[1px_1px_0_0_#000] dark:active:shadow-[1px_1px_0_0_#fff]",
    "active:translate-x-[3px] active:translate-y-[3px]",
    "transition-[transform,box-shadow] duration-75",
    "font-black text-xl leading-none space-grotesk-600",
);

const buildListContainerVariants = (count) => ({
    hidden: {},
    visible: {
        transition: {
            staggerChildren: Math.min(0.025, 0.5 / Math.max(count, 1)),
        },
    },
});

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

    const handleToggle = useCallback((key) => {
        if (key === "showDate") setShowDate(v => !v);
        else if (key === "showNote") setShowNote(v => !v);
        else if (key === "showColorOnly") setShowColorOnly(v => !v);
        else if (key === "showSubcategory") setShowSubcategory(v => !v);
    }, []);

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
        <div className="space-y-3">
            <div className='flex gap-3 items-center w-full'>
                {showNavigation && (
                    <div className='flex gap-2'>
                        <m.button
                            type="button"
                            aria-label="Previous"
                            onClick={onPrevDate}
                            whileHover={{ translateX: -1, translateY: -1 }}
                            className={NEO_NAV_BUTTON}
                        >
                            ←
                        </m.button>
                        <m.button
                            type="button"
                            aria-label="Next"
                            onClick={onNextDate}
                            whileHover={{ translateX: -1, translateY: -1 }}
                            className={NEO_NAV_BUTTON}
                        >
                            →
                        </m.button>
                    </div>
                )}
                <div className='space-y-1 min-w-0'>
                    <m.h1
                        className='text-2xl md:text-3xl font-black uppercase tracking-tight space-grotesk-600 leading-none truncate'
                        key={title}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: "spring", damping: 20, stiffness: 300 }}
                    >
                        {title}
                    </m.h1>
                    <h2 className='text-[10px] uppercase tracking-widest font-bold text-neutral-500 dark:text-neutral-400 space-grotesk-600'>
                        {MonthNotes[format(currentDate, 'yyyy-MM')]}
                    </h2>
                </div>
            </div>
            <Search
                value={searchTerm}
                autoHide={false}
                onInputChange={handleSearchChange} />
            <BlocksToolbar
                view={view}
                onViewChange={onViewChange}
                category={category}
                onCategoryChange={onCategoryChange}
                listScope={listScope}
                onListScopeChange={onListScopeChange}
                toggles={blockAlterProps}
                onToggle={handleToggle}
            />
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
