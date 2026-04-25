import classNames from "classnames";
import { format, formatDistanceToNow, subMonths, startOfMonth } from "date-fns";
import { motion } from "framer-motion";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
    Cell,
} from "recharts";
import { Categories } from "./constants";
import { useCategoryHex, useChartTokens, BrutTooltip, brutAxis } from "./chartHelpers";

const MONTHS_TO_SHOW = 24;
const SNAP = { type: "spring", stiffness: 800, damping: 22, mass: 0.5 };

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

const rowVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i) => ({
        opacity: 1,
        x: 0,
        transition: {
            delay: i * 0.025,
            ...SNAP,
        },
    }),
};

export const BlockDetailView = ({ block, data = [], onBack }) => {
    const logs = getBlockLogs(data, block);
    const monthlyData = getMonthlyData(logs);
    const category = findCategory(block);
    const colorClass = category?.color ?? "text-(--brut-fg)";
    const maxCount = Math.max(...monthlyData.map(d => d.count), 1);
    const palette = useCategoryHex();
    const tokens = useChartTokens();
    const fillColor = palette[category?.name] ?? tokens.muted;

    const sortedLogs = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date));

    return (
        <div className="pb-40 space-y-5">
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={SNAP}
                className="flex items-center gap-3"
            >
                <motion.button
                    whileHover={{ x: -2, y: -2 }}
                    whileTap={{ x: 2, y: 2 }}
                    transition={SNAP}
                    onClick={onBack}
                    className="px-3 py-1.5 brut-border brut-shadow-sm bg-(--color-brut-paper) text-sm font-bold uppercase tracking-wide hover:bg-(--color-brut-yellow)"
                >
                    ← Data
                </motion.button>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...SNAP, delay: 0.04 }}
                className="brut-card p-4"
            >
                <h1 className={classNames("text-4xl uppercase tracking-tight", colorClass)} style={{ fontFamily: 'var(--font-display)', fontWeight: 900 }}>
                    {block}
                </h1>
                {category && (
                    <p className="brut-label opacity-70 mt-1">
                        {category.name}
                    </p>
                )}
            </motion.div>

            <motion.div
                className="grid grid-cols-2 gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.08 }}
            >
                <div className="brut-card p-3">
                    <p className="text-3xl font-black" style={{ fontFamily: 'var(--font-display)' }}>{logs.length}</p>
                    <p className="brut-label opacity-70">Total</p>
                </div>
                {sortedLogs[0] && (
                    <div className="brut-card p-3">
                        <p className="text-3xl font-black" style={{ fontFamily: 'var(--font-display)' }}>
                            {formatDistanceToNow(new Date(sortedLogs[0].date), { addSuffix: false })}
                        </p>
                        <p className="brut-label opacity-70">Last entry</p>
                    </div>
                )}
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12, ...SNAP }}
                className="brut-card p-4"
            >
                <h2 className="brut-label mb-3 opacity-70">
                    Monthly count · last {MONTHS_TO_SHOW} months
                </h2>
                <div className="overflow-hidden w-full">
                <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={monthlyData} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
                        <CartesianGrid stroke={tokens.gridDim} strokeWidth={1} strokeDasharray="0" vertical={false} />
                        <XAxis
                            dataKey="label"
                            interval={Math.floor(MONTHS_TO_SHOW / 8)}
                            {...brutAxis(tokens)}
                        />
                        <YAxis
                            allowDecimals={false}
                            domain={[0, maxCount]}
                            {...brutAxis(tokens)}
                        />
                        <Tooltip content={<BrutTooltip suffix="entries" />} cursor={{ fill: tokens.gridDim }} />
                        <Bar dataKey="count" radius={0} maxBarSize={20} stroke={tokens.border} strokeWidth={1.5}>
                            {monthlyData.map((entry) => (
                                <Cell
                                    key={entry.key}
                                    fill={entry.count > 0 ? fillColor : tokens.gridDim}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
                </div>
            </motion.div>

            {sortedLogs.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.16 }}
                >
                    <h2 className="brut-label mb-3 opacity-70">
                        All entries
                    </h2>
                    <div className="space-y-1">
                        {sortedLogs.map((log, i) => (
                            <motion.div
                                key={log.id ?? `${log.date}-${i}`}
                                custom={i}
                                variants={rowVariants}
                                initial="hidden"
                                animate="visible"
                                className="flex items-start gap-3 py-2 border-b-2 border-(--brut-border)/30"
                            >
                                <span className="text-sm font-bold uppercase tracking-wide w-24 shrink-0 opacity-70">
                                    {format(new Date(log.date), "dd MMM yy")}
                                </span>
                                <div className="flex flex-col min-w-0">
                                    {log.name && log.name !== log.subcategory && (
                                        <span className="text-sm font-bold truncate">
                                            {log.note || log.name}
                                        </span>
                                    )}
                                    {(log.name || log.subcategory || log.location) && (
                                        <span className="text-xs opacity-70">
                                            {[log.name, log.subcategory, log.location].filter(Boolean).join(" · ")}
                                        </span>
                                    )}
                                    {log.thought && (
                                        <span className="text-xs opacity-60 mt-1 whitespace-pre-wrap">
                                            {log.thought}
                                        </span>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}

            {sortedLogs.length === 0 && (
                <motion.p
                    className="text-sm opacity-60 brut-card p-4"
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
