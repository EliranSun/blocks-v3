import { useState, useMemo } from "react";
import classNames from "classnames";
import {
  format,
  subMonths,
  startOfWeek,
  differenceInWeeks,
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
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { Categories } from "./constants";
import { useCategoryHex, useChartTokens, BrutTooltip, brutAxis } from "./chartHelpers";

const SNAP = { type: "spring", stiffness: 800, damping: 22, mass: 0.5 };

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

function getCategoryDistribution(logs, palette) {
  const counts = {};
  logs.forEach((l) => {
    const cat = l.category?.toLowerCase().trim() || "other";
    counts[cat] = (counts[cat] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([name, value]) => ({
      name,
      value,
      color: palette[name] || "#999",
    }))
    .sort((a, b) => b.value - a.value);
}

function getTopBlocks(logs, palette, limit = 10) {
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
      color: palette[b.category] || "#999",
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
  transition: { ...SNAP, delay },
});

const ChartCard = ({ title, children, className }) => (
    <div className={classNames("brut-card p-4", className)}>
        <h2 className="brut-label mb-3 opacity-70">{title}</h2>
        {children}
    </div>
);

export function InsightsView({ data, onBlockClick, onCategoryClick }) {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBlocks, setSelectedBlocks] = useState([]);
  const [dateRange, setDateRange] = useState("12m");
  const palette = useCategoryHex();
  const tokens = useChartTokens();

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
  const pieData = useMemo(() => getCategoryDistribution(filteredLogs, palette), [filteredLogs, palette]);
  const topBlocks = useMemo(() => getTopBlocks(filteredLogs, palette), [filteredLogs, palette]);
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

  const FilterPill = ({ active, accent, onClick, children }) => (
    <motion.button
      whileHover={{ x: -2, y: -2 }}
      whileTap={{ x: 2, y: 2 }}
      transition={SNAP}
      className={classNames(
        "px-3 py-1 text-xs uppercase tracking-wide font-bold whitespace-nowrap brut-border brut-shadow-sm shrink-0",
        active
          ? (accent || "bg-(--brut-fg) text-(--brut-bg)")
          : "bg-(--color-brut-paper) text-(--brut-fg) hover:bg-(--color-brut-yellow)"
      )}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );

  return (
    <div className="pb-40 space-y-5">
      <motion.h1
        className="text-4xl uppercase tracking-tight"
        style={{ fontFamily: 'var(--font-display)', fontWeight: 900 }}
        {...anim(0)}
      >
        Insights
      </motion.h1>

      <motion.div className="flex gap-2 flex-wrap" {...anim(0.03)}>
        {DATE_RANGES.map((r) => (
          <FilterPill
            key={r.key}
            active={dateRange === r.key}
            accent="bg-(--color-brut-orange) text-(--color-brut-ink)"
            onClick={() => setDateRange(r.key)}
          >
            {r.label}
          </FilterPill>
        ))}
      </motion.div>

      <motion.div
        className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
        {...anim(0.05)}
      >
        {categoryDefs.map((cat) => (
          <FilterPill
            key={cat.name}
            active={selectedCategories.includes(cat.name)}
            onClick={() => toggleCategory(cat.name)}
          >
            {cat.icon} {cat.name}
          </FilterPill>
        ))}
      </motion.div>

      {availableBlocks.length > 0 && (
        <motion.div
          className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
          {...anim(0.07)}
        >
          {availableBlocks.map((block) => (
            <FilterPill
              key={block}
              active={selectedBlocks.includes(block.toLowerCase())}
              accent="bg-(--color-brut-lime) text-(--color-brut-ink)"
              onClick={() => toggleBlock(block)}
            >
              {block}
            </FilterPill>
          ))}
        </motion.div>
      )}

      {hasFilters && (
        <motion.button
          className="text-xs font-bold uppercase tracking-wide underline"
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

      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center"
        {...anim(0.1)}
      >
        {[
          { label: "Total", value: stats.total, accent: "bg-(--color-brut-orange) text-(--color-brut-ink)" },
          { label: "Active days", value: stats.activeDays, accent: "bg-(--color-brut-blue) text-(--color-brut-ink)" },
          { label: "Avg/week", value: stats.avgPerWeek, accent: "bg-(--color-brut-lime) text-(--color-brut-ink)" },
          { label: "Streak", value: `${stats.streak}d`, accent: "bg-(--color-brut-pink) text-(--color-brut-ink)" },
        ].map((s) => (
          <div
            key={s.label}
            className={classNames("brut-border brut-shadow p-3", s.accent)}
          >
            <div className="text-3xl font-black" style={{ fontFamily: 'var(--font-display)' }}>{s.value}</div>
            <div className="brut-label mt-1">
              {s.label}
            </div>
          </div>
        ))}
      </motion.div>

      <motion.div {...anim(0.15)}>
        <ChartCard title="Activity Over Time">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={areaData}>
              <CartesianGrid stroke={tokens.gridDim} strokeWidth={1} strokeDasharray="0" vertical={false} />
              <XAxis
                dataKey="period"
                interval="preserveStartEnd"
                {...brutAxis(tokens)}
              />
              <YAxis width={30} {...brutAxis(tokens)} />
              <Tooltip content={<BrutTooltip />} cursor={{ fill: tokens.gridDim }} />
              {chartCats.map((cat) => (
                <Area
                  key={cat}
                  type="linear"
                  dataKey={cat}
                  stackId="1"
                  stroke={tokens.border}
                  strokeWidth={1.5}
                  fill={palette[cat] || "#999"}
                  fillOpacity={0.85}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </motion.div>

      <motion.div {...anim(0.2)}>
        <ChartCard title="Category Distribution">
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
                  paddingAngle={0}
                  stroke={tokens.border}
                  strokeWidth={2}
                  onClick={(entry) => onCategoryClick?.(entry.name)}
                  className="cursor-pointer"
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<BrutTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 justify-center mt-2">
            {pieData.map((entry) => (
              <button
                key={entry.name}
                className="flex items-center gap-1.5 text-xs px-2 py-0.5 brut-border bg-(--color-brut-paper) cursor-pointer uppercase font-bold tracking-wide"
                onClick={() => onCategoryClick?.(entry.name)}
              >
                <span
                  className="inline-block w-2.5 h-2.5"
                  style={{ backgroundColor: entry.color }}
                />
                {entry.name} ({entry.value})
              </button>
            ))}
          </div>
        </ChartCard>
      </motion.div>

      <motion.div {...anim(0.25)}>
        <ChartCard title="Top Blocks">
          <ResponsiveContainer width="100%" height={topBlocks.length * 32 + 20}>
            <BarChart data={topBlocks} layout="vertical" margin={{ left: 60 }}>
              <CartesianGrid stroke={tokens.gridDim} strokeWidth={1} strokeDasharray="0" horizontal={false} />
              <XAxis type="number" {...brutAxis(tokens)} />
              <YAxis
                type="category"
                dataKey="name"
                width={55}
                {...brutAxis(tokens)}
              />
              <Tooltip content={<BrutTooltip />} cursor={{ fill: tokens.gridDim }} />
              <Bar
                dataKey="count"
                radius={0}
                stroke={tokens.border}
                strokeWidth={1.5}
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
        </ChartCard>
      </motion.div>

      <motion.div {...anim(0.3)}>
        <ChartCard title="Day of Week">
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={dayData}>
              <CartesianGrid stroke={tokens.gridDim} strokeWidth={1} strokeDasharray="0" vertical={false} />
              <XAxis dataKey="day" {...brutAxis(tokens)} />
              <YAxis width={30} {...brutAxis(tokens)} />
              <Tooltip content={<BrutTooltip />} cursor={{ fill: tokens.gridDim }} />
              <Bar dataKey="count" fill="var(--color-brut-orange)" stroke={tokens.border} strokeWidth={1.5} radius={0} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </motion.div>

      <motion.div {...anim(0.35)}>
        <ChartCard title="This Month vs Last Month">
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
                    className="flex items-center justify-between px-3 py-2 brut-border brut-shadow-sm bg-(--color-brut-paper) cursor-pointer"
                    onClick={() => onCategoryClick?.(m.category)}
                  >
                    <span className="text-sm font-bold uppercase tracking-wide">
                      {catDef?.icon} {m.category}
                    </span>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="opacity-50">
                        {m.previous}
                      </span>
                      <span className="font-black text-lg" style={{ fontFamily: 'var(--font-display)' }}>
                        {m.current}
                      </span>
                      <span
                        className={classNames("text-xs font-black uppercase tracking-wide min-w-[3rem] text-right", {
                          "text-brut-lime": m.delta > 0,
                          "text-brut-red": m.delta < 0,
                          "opacity-50": m.delta === 0,
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
        </ChartCard>
      </motion.div>
    </div>
  );
}
