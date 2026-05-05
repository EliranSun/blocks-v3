import classNames from "classnames";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

const VARIANT_BG = {
    error: "bg-red-400",
    success: "bg-lime-400",
    info: "bg-yellow-300",
};

export const Toast = ({ message, variant = "error", action, onDismiss }) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: 40, y: 8 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 40, scale: 0.96 }}
            transition={{ type: "spring", damping: 24, stiffness: 520, mass: 0.55 }}
            className={classNames(
                "pointer-events-auto rounded-sm",
                "border-[3px] border-black dark:border-white",
                "shadow-[5px_5px_0_0_#000] dark:shadow-[5px_5px_0_0_#fff]",
                "px-4 py-3 min-w-[280px] max-w-sm text-black",
                "space-grotesk-600 font-semibold",
                VARIANT_BG[variant] || VARIANT_BG.error,
            )}
            role={variant === "error" ? "alert" : "status"}
        >
            <div className="flex items-start gap-3">
                <p className="flex-1 uppercase tracking-tight text-sm leading-snug">
                    {message}
                </p>
                <button
                    type="button"
                    onClick={onDismiss}
                    aria-label="Dismiss"
                    className={classNames(
                        "shrink-0 -mt-1 -mr-1 px-2 py-0.5 leading-none text-lg font-black",
                        "border-[2px] border-black bg-white text-black rounded-none",
                        "shadow-[2px_2px_0_0_#000]",
                        "active:translate-x-[2px] active:translate-y-[2px] active:shadow-[0px_0px_0_0_#000]",
                        "transition-[transform,box-shadow] duration-75",
                    )}
                >
                    ×
                </button>
            </div>
            {action && (
                <div className="mt-3">
                    <button
                        type="button"
                        onClick={action.onClick}
                        className={classNames(
                            "uppercase tracking-tight text-sm font-black",
                            "border-[3px] border-black bg-white text-black rounded-none",
                            "px-3 py-1 shadow-[3px_3px_0_0_#000]",
                            "active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_0_#000]",
                            "transition-[transform,box-shadow] duration-75",
                        )}
                    >
                        {action.label}
                    </button>
                </div>
            )}
        </motion.div>
    );
};
