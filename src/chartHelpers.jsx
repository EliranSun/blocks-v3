import { CategoryHex } from "./constants";
import { useTheme } from "./ThemeContext";

export const useCategoryHex = () => {
    const { theme } = useTheme();
    return CategoryHex[theme] || CategoryHex.light;
};

export const useChartTokens = () => {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    return {
        border: isDark ? "#ffffff" : "#0a0a0a",
        ink: isDark ? "#ffffff" : "#0a0a0a",
        paper: isDark ? "#15151a" : "#fff8ec",
        muted: isDark ? "#a3a3a3" : "#404040",
        gridDim: isDark ? "rgba(255,255,255,0.15)" : "rgba(10,10,10,0.15)",
    };
};

export const BrutTooltip = ({ active, payload, label, suffix }) => {
    const t = useChartTokens();
    if (!active || !payload?.length) return null;
    return (
        <div
            className="text-xs px-3 py-2 brut-border brut-shadow-sm"
            style={{ background: t.paper, color: t.ink, fontFamily: "var(--font-ui)" }}
        >
            <p className="font-black uppercase tracking-wide mb-1">{label}</p>
            {payload.map((p, i) => (
                <p key={i} className="font-bold" style={{ color: p.color || t.ink }}>
                    {p.name ? `${p.name}: ` : ""}{p.value}{suffix ? ` ${suffix}` : ""}
                </p>
            ))}
        </div>
    );
};

export const brutAxis = (tokens) => ({
    tick: {
        fontSize: 10,
        fill: tokens.ink,
        fontFamily: "var(--font-ui)",
        fontWeight: 700,
    },
    axisLine: { stroke: tokens.border, strokeWidth: 2 },
    tickLine: false,
});
