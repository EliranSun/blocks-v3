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
} from "recharts";
import { Categories } from "./constants";
import { useChartTokens, BrutTooltip, brutAxis } from "./chartHelpers";

const MONTHS_TO_SHOW = 24;
const SNAP = { type: "spring", stiffness: 800, damping: 22, mass: 0.5 };

const BLOCK_PALETTE_LIGHT = [
    "#ff6a00", "#2b7fff", "#b6f24c", "#ffd400", "#ff4dd2",
    "#00bfa6", "#ff2e2e", "#7c3aed", "#84cc16", "#0a0a0a",
];
const BLOCK_PALETTE_DARK = [
    "#ff8a3d", "#6aa9ff", "#d2ff7a", "#ffe066", "#ff8be3",
    "#5eead4", "#ff7676", "#a78bfa", "#bef264", "#f5f5f5",
];

const useBlockPalette = () => {
    const t = useChartTokens();
    const isDark = t.paper === "#15151a";
    return isDark ? BLOCK_PALETTE_DARK : BLOCK_PALETTE_LIGHT;
};

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

function getBlockForLog(log, blocks) {
    const subcatMatch = blocks.find(
        b => log.subcategory?.toLowerCase().trim() === b.toLowerCase().trim()
    );
    if (subcatMatch) return subcatMatch;

    const nameMatch = blocks.find(
        b => log.name?.toLowerCase().trim() === b.toLowerCase().trim()
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

export const CategoryDetailView = ({ categoryName, data = [], onBack, onBlockClick }) => {
    const category = getCategoryDef(categoryName);
    const blocks = category?.blocks ?? [];
    const logs = getCategoryLogs(data, categoryName);
    const monthlyData = getStackedMonthlyData(logs, blocks);
    const palette = useBlockPalette();
    const tokens = useChartTokens();

    const sortedLogs = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date));

    const blockStats = blocks.map((block, i) => {
        const blockLogs = logs.filter(log => getBlockForLog(log, blocks) === block);
        const lastLog = [...blockLogs].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        return {
            name: block,
            count: blockLogs.length,
            last: lastLog?.date ?? null,
            color: palette[i % palette.length],
        };
    });

    return (
        <div className="pb-40 space-y-5">
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={SNAP}
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
                transition={{ ...SNAP, delay: 0.05 }}
                className={classNames("brut-border brut-shadow p-4", category?.bgColor)}
            >
                <div className="flex items-center gap-2">
                    <span className="text-3xl">{category?.icon}</span>
                    <h1 className="text-4xl uppercase tracking-tight" style={{ fontFamily: 'var(--font-display)', fontWeight: 900 }}>
                        {categoryName}
                    </h1>
                </div>
                <p className="brut-label opacity-80 mt-1">
                    Combined category view
                </p>
            </motion.div>

            <motion.div
                className="grid grid-cols-3 gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
            >
                <div className="brut-card p-3">
                    <p className="text-3xl font-black" style={{ fontFamily: 'var(--font-display)' }}>{logs.length}</p>
                    <p className="brut-label opacity-70">Total</p>
                </div>
                {sortedLogs[0] && (
                    <div className="brut-card p-3">
                        <p className="text-xl font-black" style={{ fontFamily: 'var(--font-display)' }}>
                            {formatDistanceToNow(new Date(sortedLogs[0].date), { addSuffix: false })}
                        </p>
                        <p className="brut-label opacity-70">Last</p>
                    </div>
                )}
                <div className="brut-card p-3">
                    <p className="text-3xl font-black" style={{ fontFamily: 'var(--font-display)' }}>{blocks.length}</p>
                    <p className="brut-label opacity-70">Types</p>
                </div>
            </motion.div>

            <motion.div
                className="grid grid-cols-2 gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.12 }}
            >
                {blockStats.map(({ name, count, last, color }) => (
                    <motion.button
                        key={name}
                        className="flex items-center gap-2 py-2 px-3 brut-border brut-shadow-sm bg-(--color-brut-paper) text-left"
                        whileHover={{ x: -2, y: -2 }}
                        whileTap={{ x: 2, y: 2 }}
                        transition={SNAP}
                        onClick={() => onBlockClick?.(name)}
                    >
                        <span
                            className="w-3 h-3 shrink-0 brut-border"
                            style={{ backgroundColor: color }}
                        />
                        <div className="min-w-0">
                            <p
                                className="text-sm font-bold uppercase tracking-wide truncate"
                                style={{ color }}
                            >
                                {name}
                            </p>
                            <p className="text-xs opacity-70">
                                {count > 0
                                    ? `${count}× · ${formatDistanceToNow(new Date(last), { addSuffix: false })} ago`
                                    : "None"}
                            </p>
                        </div>
                    </motion.button>
                ))}
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, ...SNAP }}
                className="brut-card p-4"
            >
                <h2 className="brut-label mb-3 opacity-70">
                    Monthly breakdown · last {MONTHS_TO_SHOW} months
                </h2>
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={monthlyData} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
                        <CartesianGrid stroke={tokens.gridDim} strokeWidth={1} strokeDasharray="0" vertical={false} />
                        <XAxis
                            dataKey="label"
                            interval={Math.floor(MONTHS_TO_SHOW / 8)}
                            {...brutAxis(tokens)}
                        />
                        <YAxis allowDecimals={false} {...brutAxis(tokens)} />
                        <Tooltip content={<BrutTooltip />} cursor={{ fill: tokens.gridDim }} />
                        {blocks.map((block, i) => (
                            <Bar
                                key={block}
                                dataKey={block}
                                stackId="a"
                                fill={palette[i % palette.length]}
                                stroke={tokens.border}
                                strokeWidth={1}
                                maxBarSize={22}
                                radius={0}
                            />
                        ))}
                    </BarChart>
                </ResponsiveContainer>

                <div className="flex flex-wrap gap-2 mt-3">
                    {blocks.map((block, i) => (
                        <button
                            key={block}
                            className="flex items-center gap-1.5 text-xs px-2 py-0.5 brut-border bg-(--color-brut-paper)"
                            onClick={() => onBlockClick?.(block)}
                        >
                            <span
                                className="w-2.5 h-2.5 shrink-0"
                                style={{ backgroundColor: palette[i % palette.length] }}
                            />
                            <span className="uppercase font-bold tracking-wide">{block}</span>
                        </button>
                    ))}
                </div>
            </motion.div>

            {sortedLogs.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <h2 className="brut-label mb-3 opacity-70">
                        All entries
                    </h2>
                    <div className="space-y-1">
                        {sortedLogs.map((log, i) => {
                            const blockIndex = blocks.findIndex(
                                b => getBlockForLog(log, blocks) === b
                            );
                            const blockColor =
                                blockIndex >= 0
                                    ? palette[blockIndex % palette.length]
                                    : tokens.muted;
                            const matchedBlock = blockIndex >= 0 ? blocks[blockIndex] : null;

                            return (
                                <motion.div
                                    key={log.id ?? log._id ?? `${log.date}-${i}`}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{
                                        delay: i * 0.02,
                                        ...SNAP,
                                    }}
                                    className="flex items-start gap-3 py-2 border-b-2 border-(--brut-border)/30"
                                >
                                    <span className="text-sm font-bold uppercase tracking-wide w-24 shrink-0 opacity-70">
                                        {format(new Date(log.date), "dd MMM yy")}
                                    </span>
                                    <div className="flex flex-col min-w-0 flex-1">
                                        {log.name && (
                                            <span className="text-sm font-bold truncate">
                                                {log.note || log.name}
                                            </span>
                                        )}
                                        <div className="flex items-center gap-2">
                                            {matchedBlock && (
                                                <span
                                                    className="text-xs font-bold uppercase tracking-wide"
                                                    style={{ color: blockColor }}
                                                >
                                                    {matchedBlock}
                                                </span>
                                            )}
                                            {log.location && (
                                                <span className="text-xs opacity-60">
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
