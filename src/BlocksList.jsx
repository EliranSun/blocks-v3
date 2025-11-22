import { format } from "date-fns";
import { CategoryColors } from "./constants";
import classNames from "classnames";

export const BlocksList = ({ data = [] }) => {
    return (
        <ul className='flex flex-wrap gap-2 space-grotesk-400'>
            {data.map(item =>
                <li
                    key={item.date + item.name}
                    className={classNames({
                        "px-2 py-1 text-center border-b-2": true,
                        "font-bold text-sm grow-0": true,
                        [CategoryColors[item.category.toLowerCase()]]: true,
                    })}>
                    {item.name}, {format(item.date, "MMM dd, EE")}
                </li>)}
        </ul>
    )
}