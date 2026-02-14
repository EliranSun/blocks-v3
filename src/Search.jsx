import { useState } from 'react';
import { Button } from './Button';
import { motion, AnimatePresence } from 'framer-motion';

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
        <div className="flex flex-row-reverse items-center gap-2 border border-neutral-200 dark:border-neutral-700 rounded-none">
            <Button
                onClick={handleToggle}
                aria-label="Toggle search"
            >
                <motion.svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    animate={{ rotate: isOpen ? 0 : -90 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                </motion.svg>
            </Button>
            <motion.div
                className="relative flex items-center text-lg overflow-hidden"
                animate={{
                    width: isOpen ? "100%" : 0,
                    opacity: isOpen ? 1 : 0,
                    paddingLeft: isOpen ? 16 : 0,
                    paddingRight: isOpen ? 16 : 0,
                }}
                transition={{
                    type: "spring",
                    damping: 22,
                    stiffness: 280,
                }}
                style={{ paddingTop: 8, paddingBottom: 8 }}
            >
                <input
                    type="text"
                    className="w-full outline-none bg-transparent"
                    value={value}
                    placeholder="Search..."
                    onChange={event => onInputChange(event.target.value)}
                    autoFocus={isOpen}
                />
                <AnimatePresence>
                    {value && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
                            transition={{ type: "spring", stiffness: 400, damping: 15 }}
                            whileTap={{ scale: 0.85 }}
                            onClick={() => onInputChange('')}
                            aria-label="Clear search"
                            className="flex items-center justify-center ml-2 p-1 rounded-full"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </motion.button>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    )
}
