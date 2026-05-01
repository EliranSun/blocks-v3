import { useState } from 'react';
import classNames from 'classnames';
import { motion, AnimatePresence } from 'framer-motion';
import { Search as SearchIcon, X } from 'lucide-react';

const NEO_BUTTON = classNames(
    "shrink-0 w-11 h-11 flex items-center justify-center rounded-sm",
    "border-[3px] border-black dark:border-white",
    "bg-white text-black dark:bg-neutral-800 dark:text-white",
    "shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff]",
    "active:shadow-[1px_1px_0_0_#000] dark:active:shadow-[1px_1px_0_0_#fff]",
    "active:translate-x-[3px] active:translate-y-[3px]",
    "transition-[transform,box-shadow] duration-75",
);

export const Search = ({
    value,
    onOpen = () => { },
    onClose = () => { },
    autoHide = true,
    onInputChange = () => { }
}) => {
    const [isOpen, setIsOpen] = useState(!autoHide);

    const handleToggle = () => {
        if (!autoHide) return;

        setIsOpen(!isOpen);

        isOpen ? onClose() : onOpen();

        if (isOpen) {
            onInputChange('');
        }
    };

    return (
        <div className="flex flex-row-reverse items-stretch gap-2">
            <motion.button
                type="button"
                onClick={handleToggle}
                whileHover={{ translateX: -1, translateY: -1 }}
                aria-label="Toggle search"
                className={NEO_BUTTON}
            >
                <motion.div
                    animate={{ rotate: isOpen ? 0 : -90 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                    <SearchIcon size={20} strokeWidth={3} />
                </motion.div>
            </motion.button>
            <motion.div
                className={classNames(
                    "relative flex items-center overflow-hidden rounded-sm",
                    "border-[3px] border-black dark:border-white",
                    "bg-white text-black dark:bg-neutral-800 dark:text-white",
                    "shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff]",
                )}
                animate={{
                    width: isOpen ? "100%" : 0,
                    opacity: isOpen ? 1 : 0,
                    paddingLeft: isOpen ? 14 : 0,
                    paddingRight: isOpen ? 14 : 0,
                }}
                transition={{
                    type: "spring",
                    damping: 22,
                    stiffness: 280,
                }}
            >
                <input
                    type="text"
                    className={classNames(
                        "w-full outline-none bg-transparent py-2",
                        "font-black uppercase tracking-tight space-grotesk-600 text-base",
                        "placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
                    )}
                    value={value}
                    placeholder="Search..."
                    onChange={event => onInputChange(event.target.value)}
                    autoFocus={isOpen}
                />
                <AnimatePresence>
                    {value && (
                        <motion.button
                            type="button"
                            initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
                            transition={{ type: "spring", stiffness: 400, damping: 15 }}
                            whileTap={{ scale: 0.85 }}
                            onClick={() => onInputChange('')}
                            aria-label="Clear search"
                            className={classNames(
                                "shrink-0 ml-2 w-7 h-7 flex items-center justify-center rounded-sm",
                                "border-[2px] border-black dark:border-white",
                                "bg-amber-400 text-black",
                            )}
                        >
                            <X size={16} strokeWidth={3} />
                        </motion.button>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    )
}
