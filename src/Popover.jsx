import classNames from "classnames";
import { motion, AnimatePresence } from "framer-motion";

export const Popover = ({ children, isOpen }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                    <motion.div
                        className={classNames(
                            "pointer-events-auto rounded-sm",
                            "bg-[#fffbe6] text-black",
                            "border-[3px] border-black shadow-[8px_8px_0_0_#000]",
                            "p-6 w-full max-w-xl max-h-[80vh] overflow-hidden",
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
            )}
        </AnimatePresence>
    )
}
