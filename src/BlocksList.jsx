import { WeekView } from "./WeekView";
import { YearView } from "./YearView";
import { Block } from "./Block";

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

export const BlocksList = ({ currentDate, data = [], view, showDate, showNote, onBlockClick }) => {

    const renderView = () => {
        if (view === 'week') {
            return (
                <WeekView
                    currentDate={currentDate}
                    data={data}
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
                    data={data}
                    showDate={showDate}
                    onBlockClick={onBlockClick}
                />
            );
        }

        return (
            <ul className='flex flex-wrap gap-2'>
                {data.reverse().map(item =>
                    <Block
                        key={item.date + item.name}
                        item={item}
                        showDate={showDate}
                        variant="list"
                        onClick={onBlockClick}
                    />
                )}
            </ul>
        )
    }

    return (
        <div className="space-grotesk-400">
            {renderView()}
        </div>
    )
}