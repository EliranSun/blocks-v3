import { useState, useMemo } from "react";
import classNames from "classnames";
import {
  format,
  subMonths,
  startOfMonth,
  startOfWeek,
  differenceInWeeks,
  differenceInDays,
  getDay,
} from "date-fns";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
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

const DATE_RANGES = [
  { key: "3m", label: "3M", months: 3 },
  { key: "6m", label: "6M", months: 6 },
  { key: "12m", label: "12M", months: 12 },
  { key: "24m", label: "24M", months: 24 },
  { key: "all", label: "All", months: null },
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getCategoryForBlock(blockName) {
  for (const cat of Object.values(Categories)) {
    if (cat.blocks.some((b) => b.toLowerCase() === blockName.toLowerCase())) {
      return cat.name;
    }
  }
  return null;
}

function getStreak(logs) {
  if (!logs.length) return 0;
  const uniqueDays = new Set(
    logs.map((l) => format(new Date(l.date), "yyyy-MM-dd"))
  );
  let streak = 0;
  let d = new Date();
  const todayStr = format(d, "yyyy-MM-dd");
  if (!uniqueDays.has(todayStr)) {
    d = new Date(d);
    d.setDate(d.getDate() - 1);
  }
  while (uniqueDays.has(format(d, "yyyy-MM-dd"))) {
    streak++;
    d = new Date(d);
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

function getActiveDays(logs) {
  return new Set(logs.map((l) => format(new Date(l.date), "yyyy-MM-dd"))).size;
}

function getWeeklyAreaData(logs) {
  if (!logs.length) return [];
  const cats = Object.values(Categories).map((c) => c.name);
  const dates = logs.map((l) => new Date(l.date));
  const minDate = new Date(Math.min(...dates));
  const maxDate = new Date(Math.max(...dates));
  const totalWeeks = Math.max(1, differenceInWeeks(maxDate, minDate) + 1);

  const useMonthly = totalWeeks > 52;

  if (useMonthly) {
    const buckets = {};
    logs.forEach((l) => {
      const key = format(new Date(l.date), "yyyy-MM");
      const cat = l.category?.toLowerCase().trim() || "other";
      if (!buckets[key]) buckets[key] = { period: key };
      buckets[key][cat] = (buckets[key][cat] || 0) + 1;
    });
    return Object.values(buckets).sort((a, b) =>
      a.period.localeCompare(b.period)
    );
  }

  const buckets = {};
  logs.forEach((l) => {
    const d = new Date(l.date);
    const ws = startOfWeek(d);
    const key = format(ws, "yyyy-MM-dd");
    const cat = l.category?.toLowerCase().trim() || "other";
    if (!buckets[key])
      buckets[key] = { period: format(ws, "MMM d") };
    buckets[key][cat] = (buckets[key][cat] || 0) + 1;
  });
  return Object.entries(buckets)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => v);
}

function getCategoryDistribution(logs) {
  const counts = {};
  logs.forEach((l) => {
    const cat = l.category?.toLowerCase().trim() || "other";
    counts[cat] = (counts[cat] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([name, value]) => ({
      name,
      value,
      color: CATEGORY_HEX[name] || "#999",
    }))
    .sort((a, b) => b.value - a.value);
}

function getTopBlocks(logs, limit = 10) {
  const counts = {};
  logs.forEach((l) => {
    const name = l.name?.toLowerCase().trim();
    if (!name) return;
    if (!counts[name]) {
      counts[name] = {
        name: l.name,
        count: 0,
        category: l.category?.toLowerCase().trim(),
      };
    }
    counts[name].count++;
  });
  return Object.values(counts)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map((b) => ({
      ...b,
      color: CATEGORY_HEX[b.category] || "#999",
    }));
}

function getDayOfWeekData(logs) {
  const counts = [0, 0, 0, 0, 0, 0, 0];
  logs.forEach((l) => {
    counts[getDay(new Date(l.date))]++;
  });
  return counts.map((count, i) => ({ day: DAY_NAMES[i], count }));
}

function getMonthComparison(logs) {
  const now = new Date();
  const currentMonth = format(now, "yyyy-MM");
  const prevMonth = format(subMonths(now, 1), "yyyy-MM");
  const cats = Object.values(Categories).map((c) => c.name);

  return cats.map((cat) => {
    const current = logs.filter(
      (l) =>
        format(new Date(l.date), "yyyy-MM") === currentMonth &&
        l.category?.toLowerCase().trim() === cat
    ).length;
    const previous = logs.filter(
      (l) =>
        format(new Date(l.date), "yyyy-MM") === prevMonth &&
        l.category?.toLowerCase().trim() === cat
    ).length;
    const delta = previous > 0 ? Math.round(((current - previous) / previous) * 100) : current > 0 ? 100 : 0;
    return { category: cat, current, previous, delta };
  });
}

const anim = (delay = 0) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { type: "spring", damping: 20, stiffness: 300, delay },
});

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-neutral-800 text-white text-xs rounded px-2 py-1 shadow-lg">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || p.fill }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

const PieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-neutral-800 text-white text-xs rounded px-2 py-1 shadow-lg">
      <p>{d.name}: {d.value}</p>
    </div>
  );
};

export function InsightsView({ data, onBlockClick, onCategoryClick }) {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBlocks, setSelectedBlocks] = useState([]);
  const [dateRange, setDateRange] = useState("12m");

  const filteredLogs = useMemo(() => {
    if (!data) return [];
    let result = [...data];

    const rangeConfig = DATE_RANGES.find((r) => r.key === dateRange);
    if (rangeConfig?.months) {
      const cutoff = subMonths(new Date(), rangeConfig.months);
      result = result.filter((l) => new Date(l.date) >= cutoff);
    }

    if (selectedCategories.length > 0) {
      result = result.filter((l) =>
        selectedCategories.includes(l.category?.toLowerCase().trim())
      );
    }

    if (selectedBlocks.length > 0) {
      result = result.filter((l) =>
        selectedBlocks.includes(l.name?.toLowerCase().trim())
      );
    }

    return result;
  }, [data, dateRange, selectedCategories, selectedBlocks]);

  const availableBlocks = useMemo(() => {
    if (selectedCategories.length === 0 || selectedCategories.length > 2)
      return [];
    const blocks = [];
    Object.values(Categories).forEach((cat) => {
      if (selectedCategories.includes(cat.name)) {
        blocks.push(...cat.blocks);
      }
    });
    return blocks;
  }, [selectedCategories]);

  const stats = useMemo(() => {
    const total = filteredLogs.length;
    const activeDays = getActiveDays(filteredLogs);
    const rangeConfig = DATE_RANGES.find((r) => r.key === dateRange);
    const weeks = rangeConfig?.months
      ? (rangeConfig.months * 52) / 12
      : filteredLogs.length > 0
        ? Math.max(
          1,
          differenceInWeeks(
            new Date(),
            new Date(
              Math.min(...filteredLogs.map((l) => new Date(l.date)))
            )
          )
        )
        : 1;
    const avgPerWeek = (total / weeks).toFixed(1);
    const streak = getStreak(filteredLogs);
    return { total, activeDays, avgPerWeek, streak };
  }, [filteredLogs, dateRange]);

  const areaData = useMemo(() => getWeeklyAreaData(filteredLogs), [filteredLogs]);
  const pieData = useMemo(() => getCategoryDistribution(filteredLogs), [filteredLogs]);
  const topBlocks = useMemo(() => getTopBlocks(filteredLogs), [filteredLogs]);
  const dayData = useMemo(() => getDayOfWeekData(filteredLogs), [filteredLogs]);
  const monthComparison = useMemo(() => getMonthComparison(data || []), [data]);

  const categoryDefs = Object.values(Categories);
  const activeCats = selectedCategories.length > 0
    ? categoryDefs.filter((c) => selectedCategories.includes(c.name))
    : categoryDefs;
  const chartCats = activeCats.map((c) => c.name);

  const toggleCategory = (catName) => {
    setSelectedCategories((prev) =>
      prev.includes(catName)
        ? prev.filter((c) => c !== catName)
        : [...prev, catName]
    );
    setSelectedBlocks([]);
  };

  const toggleBlock = (blockName) => {
    const lower = blockName.toLowerCase();
    setSelectedBlocks((prev) =>
      prev.includes(lower)
        ? prev.filter((b) => b !== lower)
        : [...prev, lower]
    );
  };

  const hasFilters =
    selectedCategories.length > 0 ||
    selectedBlocks.length > 0 ||
    dateRange !== "12m";

  return (
    <div className="pb-40 space-y-6">
      <motion.h1
        className="text-2xl font-bold dark:text-white"
        {...anim(0)}
      >
        Insights
      </motion.h1>

      {/* Date range filter */}
      <motion.div className="flex gap-2 flex-wrap" {...anim(0.03)}>
        {DATE_RANGES.map((r) => (
          <motion.button
            key={r.key}
            whileTap={{ scale: 0.92 }}
            className={classNames(
              "px-3 py-1 rounded-full text-sm font-semibold transition-colors",
              dateRange === r.key
                ? "bg-amber-500 text-white"
                : "bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300"
            )}
            onClick={() => setDateRange(r.key)}
          >
            {r.label}
          </motion.button>
        ))}
      </motion.div>

      {/* Category filter */}
      <motion.div
        className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
        {...anim(0.05)}
      >
        {categoryDefs.map((cat) => (
          <motion.button
            key={cat.name}
            whileTap={{ scale: 0.92 }}
            className={classNames(
              "px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors shrink-0",
              selectedCategories.includes(cat.name)
                ? "bg-neutral-800 text-white ring-2 ring-neutral-600"
                : "bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-400"
            )}
            onClick={() => toggleCategory(cat.name)}
          >
            {cat.icon} {cat.name}
          </motion.button>
        ))}
      </motion.div>

      {/* Block filter */}
      {availableBlocks.length > 0 && (
        <motion.div
          className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
          {...anim(0.07)}
        >
          {availableBlocks.map((block) => (
            <motion.button
              key={block}
              whileTap={{ scale: 0.92 }}
              className={classNames(
                "px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors shrink-0",
                selectedBlocks.includes(block.toLowerCase())
                  ? "bg-amber-500 text-white"
                  : "bg-neutral-100 dark:bg-neutral-700 dark:text-neutral-400"
              )}
              onClick={() => toggleBlock(block)}
            >
              {block}
            </motion.button>
          ))}
        </motion.div>
      )}

      {/* Clear filters */}
      {hasFilters && (
        <motion.button
          className="text-xs text-amber-500 underline"
          onClick={() => {
            setSelectedCategories([]);
            setSelectedBlocks([]);
            setDateRange("12m");
          }}
          {...anim(0.08)}
        >
          Clear filters
        </motion.button>
      )}

      {/* Summary stats */}
      <motion.div
        className="grid grid-cols-4 gap-3 text-center"
        {...anim(0.1)}
      >
        {[
          { label: "Total", value: stats.total },
          { label: "Active days", value: stats.activeDays },
          { label: "Avg/week", value: stats.avgPerWeek },
          { label: "Streak", value: `${stats.streak}d` },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-3"
          >
            <div className="text-xl font-bold dark:text-white">{s.value}</div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">
              {s.label}
            </div>
          </div>
        ))}
      </motion.div>

      {/* Activity over time */}
      <motion.div {...anim(0.15)}>
        <h2 className="text-sm font-semibold mb-2 dark:text-neutral-300">
          Activity Over Time
        </h2>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={areaData}>
            <XAxis
              dataKey="period"
              tick={{ fontSize: 10 }}
              stroke="#737373"
              interval="preserveStartEnd"
            />
            <YAxis tick={{ fontSize: 10 }} stroke="#737373" width={30} />
            <Tooltip content={<CustomTooltip />} />
            {chartCats.map((cat) => (
              <Area
                key={cat}
                type="monotone"
                dataKey={cat}
                stackId="1"
                stroke={CATEGORY_HEX[cat] || "#999"}
                fill={CATEGORY_HEX[cat] || "#999"}
                fillOpacity={0.6}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Category distribution */}
      <motion.div {...anim(0.2)}>
        <h2 className="text-sm font-semibold mb-2 dark:text-neutral-300">
          Category Distribution
        </h2>
        <div className="flex items-center justify-center">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={85}
                dataKey="value"
                paddingAngle={2}
                onClick={(entry) => onCategoryClick?.(entry.name)}
                className="cursor-pointer"
              >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-2 justify-center mt-2">
          {pieData.map((entry) => (
            <button
              key={entry.name}
              className="flex items-center gap-1 text-xs dark:text-neutral-300 cursor-pointer"
              onClick={() => onCategoryClick?.(entry.name)}
            >
              <span
                className="inline-block w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              {entry.name} ({entry.value})
            </button>
          ))}
        </div>
      </motion.div>

      {/* Top blocks */}
      <motion.div {...anim(0.25)}>
        <h2 className="text-sm font-semibold mb-2 dark:text-neutral-300">
          Top Blocks
        </h2>
        <ResponsiveContainer width="100%" height={topBlocks.length * 32 + 20}>
          <BarChart data={topBlocks} layout="vertical" margin={{ left: 60 }}>
            <XAxis type="number" tick={{ fontSize: 10 }} stroke="#737373" />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 11 }}
              stroke="#737373"
              width={55}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="count"
              radius={[0, 4, 4, 0]}
              onClick={(entry) => {
                const cat =
                  entry.category || getCategoryForBlock(entry.name);
                if (cat) {
                  onBlockClick?.({
                    name: entry.name,
                    category: cat,
                  });
                }
              }}
              className="cursor-pointer"
            >
              {topBlocks.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Day of week */}
      <motion.div {...anim(0.3)}>
        <h2 className="text-sm font-semibold mb-2 dark:text-neutral-300">
          Day of Week
        </h2>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={dayData}>
            <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="#737373" />
            <YAxis tick={{ fontSize: 10 }} stroke="#737373" width={30} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Monthly comparison */}
      <motion.div {...anim(0.35)}>
        <h2 className="text-sm font-semibold mb-2 dark:text-neutral-300">
          This Month vs Last Month
        </h2>
        <div className="grid grid-cols-1 gap-1">
          {monthComparison
            .filter((m) => m.current > 0 || m.previous > 0)
            .map((m) => {
              const catDef = Object.values(Categories).find(
                (c) => c.name === m.category
              );
              return (
                <button
                  key={m.category}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 cursor-pointer"
                  onClick={() => onCategoryClick?.(m.category)}
                >
                  <span className="text-sm dark:text-neutral-200">
                    {catDef?.icon} {m.category}
                  </span>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-neutral-500 dark:text-neutral-400">
                      {m.previous}
                    </span>
                    <span className="dark:text-white font-semibold">
                      {m.current}
                    </span>
                    <span
                      className={classNames("text-xs font-medium min-w-[3rem] text-right", {
                        "text-green-500": m.delta > 0,
                        "text-red-500": m.delta < 0,
                        "text-neutral-400": m.delta === 0,
                      })}
                    >
                      {m.delta > 0 ? "+" : ""}
                      {m.delta}%
                    </span>
                  </div>
                </button>
              );
            })}
        </div>
      </motion.div>
    </div>
  );
}
