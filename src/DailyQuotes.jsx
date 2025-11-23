import { useMemo } from "react";
import QuotesArray from "./quotes.json";

export const DailyQuotes = () => {
    const quote = useMemo(() => {
        // Use the current day of the month to select a quote deterministically
        const today = new Date();
        // Day of month is 1-31, so subtract 1 for 0-based index
        const index = today.getDate() % QuotesArray.length;
        return QuotesArray[index];
    }, []);

    return (
        <div className="opacity-40 merriweather-500 px-2 italic">
            <span className="pr-2">❝</span>
            {quote}
            <span className="pl-2">❞</span>
        </div>
    )
}