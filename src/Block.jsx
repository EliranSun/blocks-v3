import { format } from "date-fns";
import { CategoryColors, CategoryBgColors } from "./constants";
import classNames from "classnames";
import { motion } from "framer-motion";

export const blockItemVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 800,
            damping: 22,
            mass: 0.5,
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
            base: "px-1 py-1.5 break-words text-left font-bold text-xs border-2 border-(--brut-border)",
            useBackground: true,
        },
        year: {
            base: "px-1.5 py-1 text-left font-bold text-xs border-2 border-(--brut-border)",
            useBackground: true,
        },
        list: {
            base: "px-3 py-2 text-left font-bold text-sm grow-0 brut-border brut-shadow-sm",
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
            whileHover={onClick ? { x: -2, y: -2 } : undefined}
            whileTap={onClick ? { x: 2, y: 2 } : undefined}
            transition={{ type: "spring", stiffness: 800, damping: 22, mass: 0.5 }}
            className={classNames(
                config.base,
                colorClass,
                onClick && "cursor-pointer",
                showColorOnly && "text-[0px] h-2 border-2"
            )}
            onClick={() => onClick?.(item)}
        >
            <span className="uppercase tracking-wide">{item.name}</span>
            {showDate && <span className="opacity-80"> {format(item.date, "d MMM yy, EEE")}</span>}
            {showSubcategory && item.subcategory ? <span className="opacity-80"> · {item.subcategory}</span> : ""}
            {showNote && item.note ? <span className="opacity-80"> · {item.note}</span> : ""}
        </motion.li>
    );
};
