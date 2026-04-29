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
                        transition={{ duration: 0.18 }}
                    />
                    <motion.div
                        className={classNames(
                            "fixed inset-0 m-auto rounded-xl",
                            "bg-[#fffbe6] text-black",
                            "border-[3px] border-black shadow-[8px_8px_0_0_#000]",
                            "p-6 w-[calc(100%-2rem)] md:h-11/12 max-w-xl z-50 overflow-hidden",
                        )}
                        initial={{ opacity: 0, scale: 0.92, y: 24, rotate: -1 }}
                        animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 18, rotate: 1 }}
                        transition={{
                            type: "spring",
                            damping: 22,
                            stiffness: 380,
                            mass: 0.7,
                        }}
                    >
                        {children}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
