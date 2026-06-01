import { useMemo, useState } from "react";
import classNames from "classnames";
import { Categories } from "./constants";
import { formatDistanceToNow } from 'date-fns';
import { m } from "framer-motion";
import { useToast } from "./ToastContext.jsx";
import {
    buildTagJournalExport,
    defaultExportFilename,
    fetchAllLogs,
    triggerDownload,
} from "./exportTagJournal";

const timeAgo = date => {
    if (!date) return "None";

    try {
        return formatDistanceToNow(new Date(date), { addSuffix: false })
    } catch (error) {
        console.error(error);
    }

    return date;
};

const categoryCount = Object.keys(Categories).length;

const buildCategorySectionVariants = (count) => {
    const perDelay = Math.min(0.08, 0.5 / Math.max(count, 1));
    return {
        hidden: { opacity: 0, y: 16 },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * perDelay,
                type: "spring",
                damping: 20,
                stiffness: 300,
            },
        }),
    };
};

const blockRowVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            type: "spring",
            damping: 20,
            stiffness: 300,
        },
    },
};

const buildBlockListVariants = (count) => ({
    hidden: {},
    visible: {
        transition: {
            staggerChildren: Math.min(0.03, 0.4 / Math.max(count, 1)),
        },
    },
});

export const BlocksDataView = ({ data = [], onBlockClick, onCategoryClick }) => {
    const { showError, showToast } = useToast();
    const [exporting, setExporting] = useState(false);

    const handleExport = async () => {
        if (exporting) return;
        setExporting(true);
        try {
            const logs = await fetchAllLogs();
            const payload = buildTagJournalExport(logs);
            triggerDownload(payload, defaultExportFilename());
            const count = Object.keys(payload.logs).length;
            showToast({
                message: `Exported ${logs.length} blocks across ${count} days.`,
                variant: "success",
            });
        } catch (err) {
            showError("Export failed.", {
                details: {
                    message: err?.message,
                    status: err?.status,
                    body: err?.body,
                    timestamp: new Date().toISOString(),
                },
            });
        } finally {
            setExporting(false);
        }
    };

    const categorySectionVariants = useMemo(
        () => buildCategorySectionVariants(categoryCount),
        []
    );

    const categoryEntries = useMemo(
        () => Object.values(Categories).map(category => {
            const perBlock = category.blocks.map(block => {
                const blocks = data.filter(item =>
                    item.name.toLowerCase().trim() === block.toLowerCase().trim() ||
                    item.category.toLowerCase().trim() === block.toLowerCase().trim() ||
                    item.subcategory?.toLowerCase().trim() === block.toLowerCase().trim()
                );
                return { block, blocks };
            });
            return { category, perBlock };
        }),
        [data]
    );

    return (
        <div className="space-y-2 pb-40">
            <m.h1
                className="text-xl merriweather-900"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
            >
                BLOCKS DATA
            </m.h1>
            <button
                type="button"
                onClick={handleExport}
                disabled={exporting}
                className={classNames(
                    "space-grotesk-600 text-sm uppercase font-bold border border-current px-3 py-2 cursor-pointer",
                    exporting && "opacity-50 cursor-not-allowed"
                )}
            >
                {exporting ? "Exporting…" : "Export to TagJournal"}
            </button>
            {categoryEntries.map(({ category, perBlock }, catIndex) => {
                const blockListVariants = buildBlockListVariants(perBlock.length);
                const CatIcon = category.icon;
                return (
                    <m.div
                        key={category.name}
                        custom={catIndex}
                        variants={categorySectionVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <m.button
                            className="flex items-center gap-2 py-2 w-full text-left"
                            whileHover={{ x: 3 }}
                            transition={{ type: "spring", stiffness: 400, damping: 20 }}
                            onClick={() => onCategoryClick?.(category.name)}
                        >
                            <CatIcon size={18} strokeWidth={2.5} />
                            <h2 className={classNames("text-lg uppercase font-bold underline merriweather-500", category.color)}>
                                {category.name}
                            </h2>
                        </m.button>
                        <m.div
                            variants={blockListVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {perBlock.map(({ block, blocks }) => (
                                <m.button
                                    key={block}
                                    className={classNames("my-2 flex w-full text-left cursor-pointer")}
                                    variants={blockRowVariants}
                                    whileHover={{ x: 4 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                    onClick={() => onBlockClick?.(block)}
                                >
                                    <h3 className={classNames(category.color, "space-grotesk-600 w-28 font-bold uppercase shrink-0")}>
                                        {block}
                                    </h3>
                                    <div className="flex gap-1 merriweather-400 min-w-0 overflow-hidden">
                                        {blocks.length ? (
                                            <span className="truncate">
                                                {[
                                                    timeAgo(blocks.at(0)?.date),
                                                    blocks.length + " times"
                                                ].filter(Boolean).join(", ")}
                                            </span>
                                        ) : "None"}
                                    </div>
                                </m.button>
                            ))}
                        </m.div>
                    </m.div>
                );
            })}
        </div>
    )
}
