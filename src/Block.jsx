import { format } from "date-fns";
import { CategoryColors, CategoryBgColors } from "./constants";
import classNames from "classnames";

export const Block = ({ item, showDate = false, variant = "list", onClick }) => {
    const variantClasses = {
        week: {
            base: "px-1 py-2 break-words text-center font-bold text-shadow-2 text-xs text-left",
            useBackground: true,
        },
        year: {
            base: "px-2 pt-1 text-center font-bold text-shadow-2 text-xs text-left",
            useBackground: true,
        },
        list: {
            base: "px-2 pt-1 text-center border-b-2 font-bold text-sm grow-0 text-left",
            useBackground: true,
        },
    };

    const config = variantClasses[variant] || variantClasses.list;
    const colorClass = config.useBackground
        ? CategoryBgColors[item.category.toLowerCase()]
        : CategoryColors[item.category.toLowerCase()];

    return (
        <li
            className={classNames(config.base, colorClass, onClick && "cursor-pointer hover:opacity-80")}
            onClick={() => onClick?.(item)}
        >
            {item.name}{showDate && ` - ${format(item.date, "d/MM/yy, EEE")}`}
        </li>
    );
};
