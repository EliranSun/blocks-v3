import classNames from "classnames";
import { motion, AnimatePresence } from "framer-motion";

export const Popover = ({ children, isOpen }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        className="fixed inset-0 bg-black/30 z-40"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    />
                    <motion.div
                        className={classNames(
                            "fixed inset-0 m-auto rounded-2xl",
                            "shadow-xl bg-white/90 dark:bg-neutral-900/90",
                            "backdrop-blur-xl border border-neutral-200/60 dark:border-neutral-700/60",
                            "p-5 w-full md:h-11/12 max-w-xl z-50 overflow-hidden",
                        )}
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{
                            type: "spring",
                            damping: 25,
                            stiffness: 350,
                            mass: 0.8,
                        }}
                    >
                        {children}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
