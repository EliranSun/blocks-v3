import { useState } from "react";
import { format } from "date-fns";
import { CategoryColors } from "./constants";
import classNames from "classnames";
import { WeekView } from "./WeekView";
import { YearView } from "./YearView";

export const BlocksList = ({ currentDate, data = [], showDate = false }) => {
    const [view, setView] = useState('list'); // 'list', 'week', or 'year'

    if (view === 'week') {
        return (
            <WeekView
                currentDate={currentDate}
                data={data}
                showDate={showDate}
                onBackToList={() => setView('list')}
            />
        );
    }

    if (view === 'year') {
        return (
            <YearView
                currentDate={currentDate}
                data={data}
                showDate={showDate}
                onBackToList={() => setView('list')}
            />
        );
    }

    return (
        <div className="space-grotesk-400">
            <div className="mb-4 flex gap-2">
                <button
                    onClick={() => setView('week')}
                    className="px-3 py-1 text-sm border rounded hover:bg-gray-100"
                >
                    Week View →
                </button>
                <button
                    onClick={() => setView('year')}
                    className="px-3 py-1 text-sm border rounded hover:bg-gray-100"
                >
                    Year View →
                </button>
            </div>
            <ul className='flex flex-wrap gap-2'>
                {data.reverse().map(item =>
                    <li
                        key={item.date + item.name}
                        className={classNames({
                            "px-2 pt-1 text-center border-b-2": true,
                            "font-bold text-sm grow-0 text-left": true,
                            [CategoryColors[item.category.toLowerCase()]]: true,
                        })}>
                        {[item.name].concat(showDate ? ` - ${format(item.date, "d/MM/yy, EEE")}` : [])}
                    </li>)}
            </ul>
        </div>
    )
}