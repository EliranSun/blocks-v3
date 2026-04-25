import { motion } from "framer-motion";
import { useTheme } from "./ThemeContext";

const SunIcon = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter" aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <line x1="12" y1="2" x2="12" y2="5" />
        <line x1="12" y1="19" x2="12" y2="22" />
        <line x1="2" y1="12" x2="5" y2="12" />
        <line x1="19" y1="12" x2="22" y2="12" />
        <line x1="4.5" y1="4.5" x2="6.5" y2="6.5" />
        <line x1="17.5" y1="17.5" x2="19.5" y2="19.5" />
        <line x1="4.5" y1="19.5" x2="6.5" y2="17.5" />
        <line x1="17.5" y1="6.5" x2="19.5" y2="4.5" />
    </svg>
);

const MoonIcon = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter" aria-hidden="true">
        <path d="M20 14.5A8 8 0 0 1 9.5 4a7 7 0 1 0 10.5 10.5z" />
    </svg>
);

export const ThemeToggle = ({ className = "" }) => {
    const { theme, toggle } = useTheme();
    const isDark = theme === "dark";
    return (
        <motion.button
            type="button"
            onClick={toggle}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            whileHover={{ x: -2, y: -2 }}
            whileTap={{ x: 2, y: 2 }}
            transition={{ type: "spring", stiffness: 800, damping: 22, mass: 0.5 }}
            className={`size-10 flex items-center justify-center brut-border brut-shadow-sm bg-(--color-brut-yellow) text-brut-ink ${className}`}
        >
            {isDark ? <SunIcon /> : <MoonIcon />}
        </motion.button>
    );
};
