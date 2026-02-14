import classNames from "classnames";
import { motion } from "framer-motion";

export const Button = ({ children, className, ...rest }) => {
    return (
        <motion.button
            whileTap={{ scale: 0.88 }}
            whileHover={{ scale: 1.08 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
            {...rest}
            className={classNames(
                "rounded-none flex items-center justify-center size-10",
                "bg-neutral-100 text-neutral-600 hover:bg-neutral-200",
                "dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700",
                "transition-colors shrink-0",
                className
            )}>
            {children}
        </motion.button>
    )
}

export const RectangleButton = ({
    children,
    type = "button",
    onClick = () => { },
    className,
    isActive,
    ...rest
}) => {
    return (
        <motion.button
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
            type={type}
            onClick={onClick}
            className={classNames(
                "px-2.5 py-1.5 rounded-none text-sm font-semibold transition-colors",
                isActive
                    ? "bg-neutral-800 text-white shadow-md ring-2 ring-neutral-600"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800/50 dark:text-neutral-300 dark:hover:bg-neutral-700/60",
                className,
            )}
            {...rest}>
            {children}
        </motion.button>
    )
}
