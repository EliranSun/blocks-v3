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
    Cell,
} from "recharts";
import { Categories } from "./constants";

const CATEGORY_HEX = {
    mood: "#000000",
    wife: "#7c3aed",
    creative: "#fbbf24",
    health: "#84cc16",
    household: "#b45309",
    family: "#dc2626",
    friends: "#0ea5e9",
    avoid: "#71717a",
};

const MONTHS_TO_SHOW = 24;

function getBlockLogs(data, block) {
    return data.filter(item =>
        item.name.toLowerCase().trim() === block.toLowerCase().trim() ||
        item.category?.toLowerCase().trim() === block.toLowerCase().trim() ||
        item.subcategory?.toLowerCase().trim() === block.toLowerCase().trim()
    );
}

function getMonthlyData(logs) {
    const now = new Date();
    const months = [];

    for (let i = MONTHS_TO_SHOW - 1; i >= 0; i--) {
        const monthDate = startOfMonth(subMonths(now, i));
        const label = format(monthDate, "MMM yy");
        const key = format(monthDate, "yyyy-MM");
        const count = logs.filter(log => {
            const d = new Date(log.date);
            return format(d, "yyyy-MM") === key;
        }).length;
        months.push({ label, count, key });
    }

    return months;
}

function findCategory(block) {
    return Object.values(Categories).find(cat =>
        cat.blocks.some(b => b.toLowerCase() === block.toLowerCase())
    );
}

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-neutral-800 text-white text-xs rounded px-3 py-2 shadow-lg">
                <p className="font-bold">{label}</p>
                <p>{payload[0].value} {payload[0].value === 1 ? "entry" : "entries"}</p>
            </div>
        );
    }
    return null;
};

const rowVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i) => ({
        opacity: 1,
        x: 0,
        transition: {
            delay: i * 0.025,
            type: "spring",
            damping: 20,
            stiffness: 300,
        },
    }),
};

export const BlockDetailView = ({ block, data = [], onBack }) => {
    const logs = getBlockLogs(data, block);
    const monthlyData = getMonthlyData(logs);
    const category = findCategory(block);
    const colorClass = category?.color ?? "text-neutral-400";
    const maxCount = Math.max(...monthlyData.map(d => d.count), 1);

    const sortedLogs = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date));

    return (
        <div className="pb-40 space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                className="flex items-center gap-3"
            >
                <button
                    onClick={onBack}
                    className="text-neutral-400 hover:text-neutral-200 transition-colors text-sm underline"
                >
                    ← Data
                </button>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", damping: 20, stiffness: 300, delay: 0.05 }}
            >
                <h1 className={classNames("text-2xl uppercase font-bold merriweather-900", colorClass)}>
                    {block}
                </h1>
                {category && (
                    <p className="text-xs uppercase tracking-widest text-neutral-400 mt-1 space-grotesk-400">
                        {category.name}
                    </p>
                )}
            </motion.div>

            {/* Stats row */}
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
            </motion.div>

            {/* Chart */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, type: "spring", damping: 20, stiffness: 300 }}
            >
                <h2 className="text-xs uppercase tracking-widest text-neutral-400 mb-3 space-grotesk-400">
                    Monthly count · last {MONTHS_TO_SHOW} months
                </h2>
                <div className="overflow-hidden w-full">
                <ResponsiveContainer width="100%" height={180}>
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
                            domain={[0, maxCount]}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.05)" }} />
                        <Bar dataKey="count" radius={[3, 3, 0, 0]} maxBarSize={24}>
                            {monthlyData.map((entry, index) => (
                                <Cell
                                    key={entry.key}
                                    fill={entry.count > 0 ? (CATEGORY_HEX[category?.name] ?? "#a3a3a3") : "#262626"}
                                    opacity={entry.count > 0 ? 0.85 : 0.3}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
                </div>
            </motion.div>

            {/* Log entries */}
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
                            console.log({ log });
                            return (
                                <motion.div
                                    key={log.id ?? `${log.date}-${i}`}
                                    custom={i}
                                    variants={rowVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="flex items-start gap-3 py-2 border-b border-neutral-800"
                                >
                                    <span className="text-neutral-400 text-sm space-grotesk-400 w-24 shrink-0">
                                        {format(new Date(log.date), "dd MMM yyyy")}
                                    </span>
                                    <div className="flex flex-col min-w-0">
                                        {log.name && log.name !== log.subcategory && (
                                            <span className="text-sm merriweather-400 truncate">
                                                {log.note || log.name}
                                            </span>
                                        )}
                                        {(log.name || log.subcategory || log.location) && (
                                            <span className="text-xs text-neutral-400 space-grotesk-400">
                                                {[log.name, log.subcategory, log.location].filter(Boolean).join(" · ")}
                                            </span>
                                        )}
                                        {log.thought && (
                                            <span className="text-xs text-neutral-500 space-grotesk-400 mt-1 whitespace-pre-wrap">
                                                {log.thought}
                                            </span>
                                        )}
                                    </div>
                                </motion.div>
                            )
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
