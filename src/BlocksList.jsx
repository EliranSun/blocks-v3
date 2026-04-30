import { WeekView } from "./WeekView";
import { YearView } from "./YearView";
import { Block } from "./Block";
import { useMemo, useState } from "react";
import { Search } from './Search';
import { Button } from "./Button";
import { format } from "date-fns";
import { MonthNotes } from './constants';
import classNames from "classnames";
import { motion, AnimatePresence } from "framer-motion";
import { BlocksToolbar } from "./BlocksToolbar";

const listContainerVariants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.025,
        },
    },
};

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
                <WeekView {...sharedProps} onAddBlock={onAddBlock} />
            );
        }

        if (view === 'year') {
            return (
                <YearView {...sharedProps} />
            );
        }

        return (
            <motion.ul
                className={classNames('flex flex-wrap', {
                    "gap-2": !showColorOnly
                })}
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
                    <motion.h1
                        className='text-2xl merriweather-900'
                        key={title}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: "spring", damping: 20, stiffness: 300 }}
                    >
                        {title}
                    </motion.h1>
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
            <BlocksToolbar
                view={view}
                onViewChange={onViewChange}
                category={category}
                onCategoryChange={onCategoryChange}
                listScope={listScope}
                onListScopeChange={onListScopeChange}
                toggles={toggles}
                onToggle={handleToggle}
            />
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
    )
}
