import { WeekView } from "./WeekView";
import { YearView } from "./YearView";
import { Block } from "./Block";
import { useMemo, useState } from "react";
import { Search } from './Search';
import { RectangleButton, Button } from "./Button";
import { format } from "date-fns";
import { MonthNotes } from './constants';
import classNames from "classnames";


const CalendarIcon = () => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 transition-transform duration-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" fill="none" />
            <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" />
            <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" />
            <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2" />
        </svg>
    )
}

export const BlocksList = ({
    view,
    onViewChange,
    currentDate,
    onNextDate,
    onPrevDate,
    data = [],
    onBlockClick,
    title,
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

    console.log({ data, filteredData });

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
            <div className="flex gap-2 flex-wrap">
                <div className="flex gap-1 p-1 rounded-none bg-neutral-100 dark:bg-neutral-800/60">
                    <RectangleButton
                        isActive={view === "list"}
                        onClick={() => {
                            onViewChange("list");
                        }}
                    >
                        📃
                    </RectangleButton>
                    <RectangleButton
                        isActive={view === "year"}
                        onClick={() => {
                            onViewChange("year");
                        }}
                    >
                        📅
                    </RectangleButton>
                    <RectangleButton
                        isActive={view === "week"}
                        onClick={() => {
                            onViewChange("week");
                        }}
                    >
                        7️⃣
                    </RectangleButton>
                </div>
                <div className="flex gap-1 p-1 rounded-none bg-neutral-100 dark:bg-neutral-800/60">
                    <RectangleButton
                        isActive={showDate}
                        onClick={() => setShowDate(!showDate)}>
                        📆
                    </RectangleButton>
                    <RectangleButton
                        isActive={showNote}
                        onClick={() => setShowNote(!showNote)}>
                        📒
                    </RectangleButton>
                    <RectangleButton
                        isActive={showColorOnly}
                        onClick={() => setShowColorOnly(!showColorOnly)}>
                        🦄
                    </RectangleButton>
                    <RectangleButton
                        isActive={showSubcategory}
                        onClick={() => setShowSubcategory(!showSubcategory)}>
                        📁
                    </RectangleButton>
                    <RectangleButton onClick={() => { }}>
                        🔃
                    </RectangleButton>
                </div>
            </div>
            <div className="space-grotesk-400">
                {renderView()}
            </div>
        </div>
    )
}