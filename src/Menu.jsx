import classNames from "classnames";
import { useState } from "react";
import { Button } from "./Button";
import { motion, AnimatePresence } from "framer-motion";

const menuVariants = {
    hidden: {
        opacity: 0,
        scale: 0.92,
        y: 10,
    },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            type: "spring",
            damping: 22,
            stiffness: 400,
            staggerChildren: 0.04,
        },
    },
    exit: {
        opacity: 0,
        scale: 0.95,
        y: 8,
        transition: { duration: 0.15 },
    },
};

const menuItemVariants = {
    hidden: { opacity: 0, x: -8 },
    visible: { opacity: 1, x: 0 },
};

export const Menu = ({ items = [], showSelectedItem, selectedItem, onItemClick = () => { }, label = "" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedItemLabel, setSelectedItemLabel] = useState(selectedItem || "");

    return (
        <div className='relative'>
            <Button
                onClick={() => setIsOpen(!isOpen)}
                className={classNames(
                    "rounded-full flex items-center justify-center", {
                    "size-12": !label,
                    "h-12 w-24": label
                })}>
                {showSelectedItem ? selectedItemLabel.slice(0, 2).trim() : (label || "≡")}
            </Button>
            <AnimatePresence>
                {isOpen && (
                    <motion.ul
                        variants={menuVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className={classNames(
                            "absolute bottom-13 rounded-xl",
                            "shadow-2xl bg-white/80 dark:bg-neutral-900/80",
                            "backdrop-blur-md border border-white/20 dark:border-neutral-700/30",
                            "p-4 space-y-2 w-40"
                        )}>
                        {items.map(({ name, icon }) =>
                            <motion.li
                                key={name}
                                variants={menuItemVariants}
                                whileHover={{ x: 4, backgroundColor: "rgba(128,128,128,0.1)" }}
                                whileTap={{ scale: 0.97 }}
                                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                onClick={() => {
                                    onItemClick(name);
                                    setSelectedItemLabel(`${icon} ${name.toUpperCase()}`);
                                    setIsOpen(false);
                                }}
                                className={classNames("rounded-md px-2 py-1 cursor-pointer", {
                                    "bg-amber-100 dark:bg-amber-900": selectedItem === name
                                })}
                            >
                                {icon} {name.toUpperCase()}
                            </motion.li>
                        )}
                    </motion.ul>
                )}
            </AnimatePresence>
        </div>
    )
}
