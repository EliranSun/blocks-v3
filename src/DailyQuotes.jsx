import { useMemo } from "react";
import QuotesArray from "./quotes.json";

export const DailyQuotes = () => {
    const quote = useMemo(() => {
        const today = new Date();
        const msPerDay = 24 * 60 * 60 * 1000;
        const startDate = new Date(1992, 5, 8); // 8.6.92
        const daysSinceStart = Math.floor((today - startDate) / msPerDay);

        // Simple hash function for better distribution
        const hash = (n) => {
            let h = n;
            h = ((h >> 16) ^ h) * 0x45d9f3b;
            h = ((h >> 16) ^ h) * 0x45d9f3b;
            h = (h >> 16) ^ h;
            return Math.abs(h);
        };

        const index = hash(daysSinceStart) % QuotesArray.length;
        return `${index + 1}. ❝ ${QuotesArray[index]} ❞`;
    }, []);

    return (
        <div className="opacity-40 merriweather-500 italic">
            {quote}
        </div>
    )
}