import classNames from "classnames";
import { motion } from "framer-motion";

const SNAP = { type: "spring", stiffness: 800, damping: 22, mass: 0.5 };

export const Button = ({ children, className, ...rest }) => {
    return (
        <motion.button
            whileHover={{ x: -2, y: -2 }}
            whileTap={{ x: 2, y: 2 }}
            transition={SNAP}
            {...rest}
            className={classNames(
                "flex items-center justify-center size-10 shrink-0",
                "brut-border brut-shadow-sm bg-(--color-brut-paper) text-(--brut-fg)",
                "hover:bg-(--color-brut-yellow) dark:hover:bg-(--color-brut-violet)",
                "transition-colors",
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
            whileHover={{ x: -2, y: -2 }}
            whileTap={{ x: 2, y: 2 }}
            transition={SNAP}
            type={type}
            onClick={onClick}
            className={classNames(
                "px-3 py-1.5 text-sm uppercase tracking-wide font-bold transition-colors",
                "brut-border",
                isActive
                    ? "bg-(--brut-fg) text-(--brut-bg) brut-shadow-sm"
                    : "bg-(--color-brut-paper) text-(--brut-fg) brut-shadow-sm hover:bg-(--color-brut-lime)",
                className,
            )}
            {...rest}>
            {children}
        </motion.button>
    )
}
