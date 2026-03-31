import { useMemo } from "react";
import { isSameWeek, addWeeks } from "date-fns";
import { MoodLabels } from "./constants";
import { motion } from "framer-motion";

const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", damping: 20, stiffness: 300 },
    },
};

export const CompletionCard = ({ weekData = [], allLogs = [], currentDate }) => {
    const { percentage, diff } = useMemo(() => {
        const thisWeekUnique = new Set(weekData.filter(l => l.category !== "mood").map(l => l.name)).size;

        // Last week
        const lastWeekDate = addWeeks(currentDate, -1);
        const lastWeekLogs = allLogs.filter(l =>
            l.category !== "mood" &&
            isSameWeek(new Date(l.date), lastWeekDate, { weekStartsOn: 1 })
        );
        const lastWeekUnique = new Set(lastWeekLogs.map(l => l.name)).size;

        // Average over last 4 weeks for percentage base
        let totalUnique = 0;
        let weeksWithData = 0;
        for (let i = 1; i <= 4; i++) {
            const wd = addWeeks(currentDate, -i);
            const wl = allLogs.filter(l =>
                l.category !== "mood" &&
                isSameWeek(new Date(l.date), wd, { weekStartsOn: 1 })
            );
            const u = new Set(wl.map(l => l.name)).size;
            if (u > 0) {
                totalUnique += u;
                weeksWithData++;
            }
        }

        const avgUnique = weeksWithData > 0 ? totalUnique / weeksWithData : thisWeekUnique;
        const pct = avgUnique > 0 ? Math.round((thisWeekUnique / avgUnique) * 100) : 0;
        const diffVal = lastWeekUnique > 0
            ? Math.round(((thisWeekUnique - lastWeekUnique) / lastWeekUnique) * 100)
            : 0;

        return { percentage: Math.min(pct, 100), diff: diffVal };
    }, [weekData, allLogs, currentDate]);

    return (
        <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="bg-neutral-100 dark:bg-neutral-800/80 rounded-2xl p-5"
        >
            <p className="text-neutral-400 dark:text-neutral-500 text-xs font-semibold tracking-wider uppercase mb-2">
                Completion
            </p>
            <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-amber-500 dark:text-amber-400">
                    {percentage}%
                </span>
                <span className={`text-sm ${diff >= 0 ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}>
                    {diff >= 0 ? "+" : ""}{diff}% vs LW
                </span>
            </div>
        </motion.div>
    );
};

export const TopMoodCard = ({ weekData = [] }) => {
    const topMood = useMemo(() => {
        const moodLogs = weekData.filter(l => l.category === "mood");
        if (moodLogs.length === 0) return null;

        const counts = {};
        moodLogs.forEach(l => {
            counts[l.name] = (counts[l.name] || 0) + 1;
        });

        const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
        return {
            emoji: top[0],
            label: MoodLabels[top[0]] || top[0],
            count: top[1],
        };
    }, [weekData]);

    if (!topMood) return null;

    return (
        <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="bg-neutral-100 dark:bg-neutral-800/80 rounded-2xl p-5"
        >
            <p className="text-neutral-400 dark:text-neutral-500 text-xs font-semibold tracking-wider uppercase mb-2">
                Top Mood
            </p>
            <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-xl">
                    {topMood.emoji}
                </span>
                <div>
                    <p className="text-neutral-800 dark:text-white font-semibold">{topMood.label}</p>
                    <p className="text-neutral-400 dark:text-neutral-500 text-xs">{topMood.count} days this week</p>
                </div>
            </div>
        </motion.div>
    );
};
