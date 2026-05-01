import classNames from "classnames";
import { motion, AnimatePresence } from "framer-motion";

export const Popover = ({ children, isOpen }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        className="fixed inset-0 z-40 backdrop-blur-md bg-white/10 dark:bg-black/10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                    />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            className={classNames(
                                "pointer-events-auto rounded-sm",
                                "bg-[#fffbe6] text-black dark:bg-neutral-900 dark:text-white",
                                "border-[3px] border-black dark:border-white shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff]",
                                "p-6 w-full max-w-xl max-h-[80vh] overflow-y-auto overscroll-contain",
                            )}
                            initial={{ opacity: 0, scale: 0.94, y: 16 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96, y: 12 }}
                            transition={{
                                type: "spring",
                                damping: 24,
                                stiffness: 520,
                                mass: 0.55,
                            }}
                        >
                            {children}
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}
