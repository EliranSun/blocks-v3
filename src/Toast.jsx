import classNames from "classnames";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useState } from "react";

const VARIANT_BG = {
    error: "bg-red-400",
    success: "bg-lime-400",
    info: "bg-yellow-300",
};

const formatDetails = (details) => {
    if (!details) return "";
    const lines = [];
    if (details.timestamp) lines.push(`Time: ${details.timestamp}`);
    if (details.url) lines.push(`URL: ${details.url}`);
    if (details.status !== undefined) lines.push(`Status: ${details.status} ${details.statusText ?? ""}`.trim());
    if (details.name) lines.push(`Error: ${details.name}`);
    if (details.message) lines.push(`Message: ${details.message}`);
    if (details.body) lines.push(`Body: ${details.body}`);
    return lines.join("\n");
};

export const Toast = ({ message, variant = "error", action, details, onDismiss }) => {
    const [expanded, setExpanded] = useState(false);
    const detailsText = formatDetails(details);
    const copyDetails = () => {
        if (!detailsText) return;
        navigator.clipboard?.writeText(detailsText).catch(() => {});
    };
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
            {(action || details) && (
                <div className="mt-3 flex flex-wrap gap-2">
                    {action && (
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
                    )}
                    {details && (
                        <button
                            type="button"
                            onClick={() => setExpanded(v => !v)}
                            aria-expanded={expanded}
                            className={classNames(
                                "uppercase tracking-tight text-sm font-black",
                                "border-[3px] border-black bg-white text-black rounded-none",
                                "px-3 py-1 shadow-[3px_3px_0_0_#000]",
                                "active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_0_#000]",
                                "transition-[transform,box-shadow] duration-75",
                            )}
                        >
                            {expanded ? "Hide error" : "Expand error"}
                        </button>
                    )}
                </div>
            )}
            {details && expanded && (
                <div className="mt-3 border-[2px] border-black bg-white text-black p-2 max-h-64 overflow-auto">
                    <pre className="text-[11px] leading-snug whitespace-pre-wrap break-all font-mono normal-case tracking-normal">
                        {detailsText}
                    </pre>
                    <button
                        type="button"
                        onClick={copyDetails}
                        className={classNames(
                            "mt-2 uppercase tracking-tight text-xs font-black",
                            "border-[2px] border-black bg-white text-black rounded-none",
                            "px-2 py-0.5 shadow-[2px_2px_0_0_#000]",
                            "active:translate-x-[1px] active:translate-y-[1px] active:shadow-[0px_0px_0_0_#000]",
                            "transition-[transform,box-shadow] duration-75",
                        )}
                    >
                        Copy
                    </button>
                </div>
            )}
        </motion.div>
    );
};
