
export const Scopes = [
    { name: "year", maxValue: 0, minValue: 3 },
    { name: "month", maxValue: 4, minValue: 6 },
    { name: "week", maxValue: 7, minValue: 9 },
    { name: "day", maxValue: 10, minValue: 12 },
];

export const Categories = {
    All: { name: "all", icon: "🌐", subcategories: [] },
    Wife: { name: "wife", icon: "❤️", subcategories: ["date", "trip", "gestures", "sex"] },
    Creative: { name: "creative", icon: "🎨", subcategories: ["play", "read", "code", "watch"] },
        Testosterone: { name: "Testosterone", icon: "⚡️", subcategories: [] },
    Health: { name: "health", icon: "🧘‍♂️", subcategories: ["fat", "weight"] },
    Household: { name: "household", icon: "🏠", subcategories: [] },
    Family: { name: "family", icon: "☀️", subcategories: ["WhatsApp", "call", "meet", "date"] },
    Friends: { name: "friends", icon: "🌳", subcategories: ["WhatsApp", "call", "meet", "date"] },
    Avoid: { name: "avoid", icon: "🚫", subcategories: [] },
};

export const CategoryColors = {
    creative: "text-orange-500",
    health: "text-green-500",
    testosterone: "text-gray-500",
    household: "text-yellow-500",
    family: "text-red-500",
    friends: "text-blue-500",
    wife: "text-pink-500",
    avoid: "text-gray-500",
};

export const CategoryBgColors = {
    creative: "bg-orange-500",
    health: "bg-green-500",
    testosterone: "bg-gray-500",
    household: "bg-yellow-500",
    family: "bg-red-500",
    friends: "bg-blue-500",
    wife: "bg-pink-500",
    avoid: "bg-gray-500",
};

export const MonthNotes = {
        "2026-01": "Dad to Lokit?!",
    "2025-12": "Job Hunt",
    "2025-11": "Ramat Gan + Unemployed",
    "2025-10": "Bus Bakerem + Move to Ramat Gan",
    "2025-09": "Wife Birthday Plan",
    "2025-08": "Portugal",
    "2025-07": "War + Bar Zakai",
    "2025-06": "Birthday + Villa + Midbara",
    "2025-05": "Lokit",
    "2025-04": "Passover + Sick",
    "2025-03": "20% CSS week",
    "2025-02": "First Baby Attempts",
    "2025-01": "Thailand",
};

