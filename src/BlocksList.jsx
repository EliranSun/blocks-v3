import { WeekView } from "./WeekView";
import { YearView } from "./YearView";
import { Block } from "./Block";
import { useMemo, useState } from "react";
import { Search } from './Search';
import { RectangleButton, Button } from "./Button";
import { format } from "date-fns";
import { MonthNotes } from './constants';


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

    const renderView = () => {
        if (view === 'week') {
            return (
                <WeekView
                    currentDate={currentDate}
                    data={filteredData}
                    showDate={showDate}
                    showNote={showNote}
                    onBlockClick={onBlockClick}
                />
            );
        }

        if (view === 'year') {
            return (
                <YearView
                    currentDate={currentDate}
                    data={filteredData}
                    showNote={showNote}
                    showDate={showDate}
                    onBlockClick={onBlockClick}
                />
            );
        }

        return (
            <ul className='flex flex-wrap gap-2'>
                {filteredData.reverse().map(item =>
                    <Block
                        key={item.date + item.name}
                        variant="list"
                        item={item}
                        showNote={showNote}
                        showDate={showDate}
                        onClick={onBlockClick}
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
            <div className="flex gap-1">
                <div className="p-1 bg-black rounded">
                    <RectangleButton
                        onClick={() => {
                            onViewChange("list");
                        }}
                    >
                        📃
                    </RectangleButton>
                    <RectangleButton
                        onClick={() => {
                            onViewChange("year");
                        }}
                    >
                        📅
                    </RectangleButton>
                    <RectangleButton
                        onClick={() => {
                            onViewChange("week");
                        }}
                    >
                        7️⃣
                    </RectangleButton>
                </div>
                <div className="p-1 bg-black rounded">
                    <RectangleButton onClick={() => setShowDate(!showDate)}>
                        📆
                    </RectangleButton>
                    <RectangleButton onClick={() => setShowNote(!showNote)}>
                        📒
                    </RectangleButton>
                    <RectangleButton onClick={() => setShowColorOnly(!showColorOnly)}>
                        🦄
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