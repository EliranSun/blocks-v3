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
                            "fixed inset-0 m-auto rounded-sm",
                            "bg-[#fffbe6] text-black",
                            "border-[3px] border-black shadow-[8px_8px_0_0_#000]",
                            "p-6 w-[calc(100%-2rem)] md:h-11/12 max-w-xl z-50 overflow-hidden",
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
                </>
            )}
        </AnimatePresence>
    )
}
