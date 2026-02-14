import { format } from "date-fns";
import { CategoryColors, CategoryBgColors } from "./constants";
import classNames from "classnames";
import { motion } from "framer-motion";

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

export const Block = ({
    item,
    showDate = false,
    showNote = false,
    showSubcategory = false,
    showColorOnly = false,
    variant = "list",
    onClick
}) => {
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
        ? CategoryBgColors[item.category?.toLowerCase()]
        : CategoryColors[item.category?.toLowerCase()];

    return (
        <motion.li
            variants={blockItemVariants}
            whileHover={onClick ? { scale: 1.03, y: -2 } : undefined}
            whileTap={onClick ? { scale: 0.97 } : undefined}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className={classNames(
                config.base,
                colorClass,
                onClick && "cursor-pointer",
                showColorOnly && "text-[0px] h-2 border-none"
            )}
            onClick={() => onClick?.(item)}
        >
            {item.name}
            {showDate && ` - ${format(item.date, "d MMM yy, EEE")}`}
            {showSubcategory && item.subcategory ? ` - ${item.subcategory}` : ""}
            {showNote && item.note ? ` - ${item.note}` : ""}
        </motion.li>
    );
};
