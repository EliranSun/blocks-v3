import classNames from "classnames";
import { format, formatDistanceToNow, subMonths, startOfMonth } from "date-fns";
import { motion } from "framer-motion";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { Categories } from "./constants";

const MONTHS_TO_SHOW = 24;

// Distinct colors assigned per block index within a category
const BLOCK_PALETTE = [
    "#7c3aed", // violet
    "#0ea5e9", // sky
    "#84cc16", // lime
    "#f59e0b", // amber
    "#ec4899", // pink
    "#06b6d4", // cyan
    "#f97316", // orange
    "#a78bfa", // violet-400
    "#dc2626", // red
    "#10b981", // emerald
];

function getCategoryDef(categoryName) {
    return Object.values(Categories).find(
        cat => cat.name.toLowerCase() === categoryName.toLowerCase()
    );
}

function getCategoryLogs(data, categoryName) {
    return data.filter(
        item => item.category?.toLowerCase().trim() === categoryName.toLowerCase().trim()
    );
}

// Determine which block a log belongs to (returns the block name or null)
function getBlockForLog(log, blocks) {
    const subcatMatch = blocks.find(
        b => log.subcategory?.toLowerCase().trim() === b.toLowerCase().trim()
    );
    if (subcatMatch) return subcatMatch;

    const nameMatch = blocks.find(
        b => log.name?.toLowerCase().trim().includes(b.toLowerCase().trim())
    );
    return nameMatch ?? null;
}

function getStackedMonthlyData(logs, blocks) {
    const now = new Date();
    const months = [];

    for (let i = MONTHS_TO_SHOW - 1; i >= 0; i--) {
        const monthDate = startOfMonth(subMonths(now, i));
        const label = format(monthDate, "MMM yy");
        const key = format(monthDate, "yyyy-MM");

        const monthLogs = logs.filter(log => format(new Date(log.date), "yyyy-MM") === key);

        const entry = { label, key };
        blocks.forEach(block => {
            entry[block] = monthLogs.filter(log => getBlockForLog(log, blocks) === block).length;
        });

        months.push(entry);
    }

    return months;
}

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const total = payload.reduce((sum, p) => sum + (p.value || 0), 0);
        const entries = payload.filter(p => p.value > 0);
        return (
            <div className="bg-neutral-800 text-white text-xs rounded px-3 py-2 shadow-lg space-y-1">
                <p className="font-bold mb-1">{label}</p>
                {entries.map(p => (
                    <p key={p.dataKey} style={{ color: p.fill }}>
                        {p.dataKey}: {p.value}
                    </p>
                ))}
                {total > 0 && (
                    <p className="text-neutral-400 pt-1 border-t border-neutral-700">
                        Total: {total}
                    </p>
                )}
            </div>
        );
    }
    return null;
};

export const CategoryDetailView = ({ categoryName, data = [], onBack, onBlockClick }) => {
    const category = getCategoryDef(categoryName);
    const blocks = category?.blocks ?? [];
    const logs = getCategoryLogs(data, categoryName);
    const monthlyData = getStackedMonthlyData(logs, blocks);

    const sortedLogs = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date));

    const blockStats = blocks.map((block, i) => {
        const blockLogs = logs.filter(log => getBlockForLog(log, blocks) === block);
        const lastLog = [...blockLogs].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        return {
            name: block,
            count: blockLogs.length,
            last: lastLog?.date ?? null,
            color: BLOCK_PALETTE[i % BLOCK_PALETTE.length],
        };
    });

    return (
        <div className="pb-40 space-y-6">
            {/* Back button */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
            >
                <button
                    onClick={onBack}
                    className="text-neutral-400 hover:text-neutral-200 transition-colors text-sm underline"
                >
                    ← Data
                </button>
            </motion.div>

            {/* Title */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", damping: 20, stiffness: 300, delay: 0.05 }}
            >
                <div className="flex items-center gap-2">
                    <span className="text-2xl">{category?.icon}</span>
                    <h1 className={classNames("text-2xl uppercase font-bold merriweather-900", category?.color)}>
                        {categoryName}
                    </h1>
                </div>
                <p className="text-xs uppercase tracking-widest text-neutral-400 mt-1 space-grotesk-400">
                    Combined category view
                </p>
            </motion.div>

            {/* Top stats */}
            <motion.div
                className="flex gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
            >
                <div>
                    <p className="text-2xl font-bold space-grotesk-600">{logs.length}</p>
                    <p className="text-xs text-neutral-400 uppercase tracking-wide">Total</p>
                </div>
                {sortedLogs[0] && (
                    <div>
                        <p className="text-2xl font-bold space-grotesk-600">
                            {formatDistanceToNow(new Date(sortedLogs[0].date), { addSuffix: false })}
                        </p>
                        <p className="text-xs text-neutral-400 uppercase tracking-wide">Last entry</p>
                    </div>
                )}
                <div>
                    <p className="text-2xl font-bold space-grotesk-600">{blocks.length}</p>
                    <p className="text-xs text-neutral-400 uppercase tracking-wide">Types</p>
                </div>
            </motion.div>

            {/* Per-block mini stats grid */}
            <motion.div
                className="grid grid-cols-2 gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.12 }}
            >
                {blockStats.map(({ name, count, last, color }) => (
                    <motion.button
                        key={name}
                        className="flex items-center gap-2 py-2 px-3 rounded-lg bg-neutral-900 hover:bg-neutral-800 transition-colors text-left"
                        whileHover={{ x: 2 }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                        onClick={() => onBlockClick?.(name)}
                    >
                        <span
                            className="w-2.5 h-2.5 rounded-sm shrink-0"
                            style={{ backgroundColor: color }}
                        />
                        <div className="min-w-0">
                            <p
                                className="text-sm font-bold uppercase space-grotesk-600 truncate"
                                style={{ color }}
                            >
                                {name}
                            </p>
                            <p className="text-xs text-neutral-400">
                                {count > 0
                                    ? `${count}x · ${formatDistanceToNow(new Date(last), { addSuffix: false })} ago`
                                    : "None"}
                            </p>
                        </div>
                    </motion.button>
                ))}
            </motion.div>

            {/* Stacked bar chart */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, type: "spring", damping: 20, stiffness: 300 }}
            >
                <h2 className="text-xs uppercase tracking-widest text-neutral-400 mb-3 space-grotesk-400">
                    Monthly breakdown · last {MONTHS_TO_SHOW} months
                </h2>
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={monthlyData} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
                        <XAxis
                            dataKey="label"
                            tick={{ fontSize: 10, fill: "#737373" }}
                            interval={Math.floor(MONTHS_TO_SHOW / 8)}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            allowDecimals={false}
                            tick={{ fontSize: 10, fill: "#737373" }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            content={<CustomTooltip />}
                            cursor={{ fill: "rgba(255,255,255,0.05)" }}
                        />
                        {blocks.map((block, i) => (
                            <Bar
                                key={block}
                                dataKey={block}
                                stackId="a"
                                fill={BLOCK_PALETTE[i % BLOCK_PALETTE.length]}
                                maxBarSize={24}
                                radius={i === blocks.length - 1 ? [3, 3, 0, 0] : [0, 0, 0, 0]}
                            />
                        ))}
                    </BarChart>
                </ResponsiveContainer>

                {/* Chart legend */}
                <div className="flex flex-wrap gap-3 mt-3">
                    {blocks.map((block, i) => (
                        <button
                            key={block}
                            className="flex items-center gap-1.5 text-xs hover:opacity-80 transition-opacity"
                            onClick={() => onBlockClick?.(block)}
                        >
                            <span
                                className="w-2.5 h-2.5 rounded-sm shrink-0"
                                style={{ backgroundColor: BLOCK_PALETTE[i % BLOCK_PALETTE.length] }}
                            />
                            <span className="text-neutral-300 uppercase space-grotesk-400">{block}</span>
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* All entries list */}
            {sortedLogs.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <h2 className="text-xs uppercase tracking-widest text-neutral-400 mb-3 space-grotesk-400">
                        All entries
                    </h2>
                    <div className="space-y-1">
                        {sortedLogs.map((log, i) => {
                            const blockIndex = blocks.findIndex(
                                b => getBlockForLog(log, blocks) === b
                            );
                            const blockColor =
                                blockIndex >= 0
                                    ? BLOCK_PALETTE[blockIndex % BLOCK_PALETTE.length]
                                    : "#525252";
                            const matchedBlock = blockIndex >= 0 ? blocks[blockIndex] : null;

                            return (
                                <motion.div
                                    key={log.id ?? log._id ?? `${log.date}-${i}`}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{
                                        delay: i * 0.02,
                                        type: "spring",
                                        damping: 20,
                                        stiffness: 300,
                                    }}
                                    className="flex items-start gap-3 py-2 border-b border-neutral-800"
                                >
                                    <span className="text-neutral-400 text-sm space-grotesk-400 w-24 shrink-0">
                                        {format(new Date(log.date), "dd MMM yyyy")}
                                    </span>
                                    <div className="flex flex-col min-w-0 flex-1">
                                        {log.name && (
                                            <span className="text-sm merriweather-400 truncate">
                                                {log.note || log.name}
                                            </span>
                                        )}
                                        <div className="flex items-center gap-2">
                                            {matchedBlock && (
                                                <span
                                                    className="text-xs font-bold uppercase space-grotesk-600"
                                                    style={{ color: blockColor }}
                                                >
                                                    {matchedBlock}
                                                </span>
                                            )}
                                            {log.location && (
                                                <span className="text-xs text-neutral-500">
                                                    {log.location}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>
            )}

            {sortedLogs.length === 0 && (
                <motion.p
                    className="text-neutral-500 text-sm merriweather-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    No entries found.
                </motion.p>
            )}
        </div>
    );
};
