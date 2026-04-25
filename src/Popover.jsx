import classNames from "classnames";
import { motion, AnimatePresence } from "framer-motion";

export const Popover = ({ children, isOpen }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        className="fixed inset-0 bg-black/60 z-40"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.12 }}
                    />
                    <motion.div
                        className={classNames(
                            "fixed inset-0 m-auto rounded-none",
                            "bg-(--color-brut-paper) text-(--brut-fg)",
                            "brut-border-thick brut-shadow-lg",
                            "p-5 w-[calc(100%-2rem)] md:h-11/12 max-w-xl z-50 overflow-hidden",
                        )}
                        initial={{ opacity: 0, y: 30, x: 8 }}
                        animate={{ opacity: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{
                            type: "spring",
                            stiffness: 800,
                            damping: 22,
                            mass: 0.5,
                        }}
                    >
                        {children}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
