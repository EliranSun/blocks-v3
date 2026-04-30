import { memo } from "react";
import { format } from "date-fns";
import { CategoryColors, CategoryBgColors } from "./constants";
import classNames from "classnames";
import { m } from "framer-motion";

export const blockItemVariants = {
    hidden: { opacity: 0, y: 8, scale: 0.97 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: "spring",
            damping: 20,
            stiffness: 300,
        },
    },
};

const variantClasses = {
    week: {
        base: "text-left font-bold space-grotesk-600 uppercase tracking-tight "
            + "text-[10px] md:text-xs leading-tight text-white dark:text-black border-2 border-black dark:border-white truncate " +
            "rounded-sm shadow-[1px_1px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff] px-1 py-2",
        useBackground: true,
    },
    year: {
        base: "px-1.5 py-0.5 text-left font-bold uppercase tracking-tight space-grotesk-600 text-[10px] leading-tight text-white border-2 border-black rounded-sm shadow-[1px_1px_0_0_#000] md:shadow-[2px_2px_0_0_#000]",
        useBackground: true,
    },
    list: {
        base: "px-2 py-1 rounded-xs border-2 md:border-[3px] " +
            "border-black dark:border-white " +
            "shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff] " +
            "md:shadow-[3px_3px_0_0_#000] dark:md:shadow-[3px_3px_0_0_#fff] " +
            "active:shadow-[1px_1px_0_0_#000] dark:active:shadow-[1px_1px_0_0_#fff] " +
            "active:translate-x-[2px] active:translate-y-[2px] " +
            "hover:-translate-y-[2px] active:scale-[0.97] " +
            "transition-[transform,box-shadow] duration-75 " +
            "font-bold uppercase tracking-tight space-grotesk-600 text-[10px] text-white dark:text-black",
        useBackground: true,
    },
};

const cvStyle = {
    contentVisibility: "auto",
    containIntrinsicSize: "32px 80px",
};

const BlockComponent = ({
    item,
    showDate = false,
    showNote = false,
    showSubcategory = false,
    showColorOnly = false,
    variant = "list",
    onClick
}) => {
    const config = variantClasses[variant] || variantClasses.list;
    const colorClass = config.useBackground
        ? CategoryBgColors[item.category?.toLowerCase()]
        : CategoryColors[item.category?.toLowerCase()];

    return (
        <m.li
            variants={blockItemVariants}
            className={classNames(
                config.base,
                colorClass,
                onClick && "cursor-pointer",
                showColorOnly && "text-[0px] h-2 border-none shadow-none"
            )}
            style={cvStyle}
            onClick={() => onClick?.(item)}
        >
            {item.name}
            {showDate && ` - ${format(item.date, "d.M.yy")}`}
            {showSubcategory && item.subcategory ? ` - ${item.subcategory}` : ""}
            {showNote && item.note ? ` - ${item.note}` : ""}
        </m.li>
    );
};

export const Block = memo(BlockComponent);
