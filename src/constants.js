
export const Scopes = [
    { name: "year", maxValue: 0, minValue: 3 },
    { name: "month", maxValue: 4, minValue: 6 },
    { name: "week", maxValue: 7, minValue: 9 },
    { name: "day", maxValue: 10, minValue: 12 },
];

export const Blocks = {
    // wife
    DATE: "date",
    TRIP: "trip",
    GESTURES: "gestures",
    SEX: "sex",

    // creative
    PLAY: "play",
    READ: "read",
    CODE: "code",
    WATCH: "watch",
    DRAW: "draw",

    // health
    // FAT: "fat",
    // WEIGHT: "weight",
    PHYSIO: "physio",
    YOGA: "yoga",
    POWER: "power",
    CARDIO: "cardio",

    // family
    DAD: "dad",
    MOM: "mom",
    GRANDMA: "grandma",
    GRANDPA: "grandpa",
    OR: "or",
    SAHAR: "sahar",
    SHACHAR: "shachar",
    OFEK: "ofek",
    YAHEL: "yahel",

    // friends
    MAYA: "maya",
    ODELIA: "odelia",
    NATI: "nati",
    OFIR: "ofir",
    DAVID: "david",
    JULIA: "julia",
    ROTEM: "rotem",

    // household
    LAUNDRY: "laundry",
    COOK: "cook",
    ORGANIZE: "organize",
    CLEAN: "clean",
    TOWELS: "towels",
    SHEETS: "sheets",

    // avoid
    DOOM_SCROLL: "doom scroll"
}

export const Categories = {
    Wife: {
        name: "wife",
        icon: "❤️",
        bgColor: "bg-violet-600",
        subcategories: [],
        blocks: [
            Blocks.DATE,
            Blocks.TRIP,
            Blocks.GESTURES,
            Blocks.SEX
        ],
    },
    Creative: {
        name: "creative",
        icon: "🎨",
        bgColor: "bg-amber-400",
        subcategories: [],
        blocks: [
            Blocks.PLAY,
            Blocks.READ,
            Blocks.CODE,
            Blocks.WATCH,
            Blocks.DRAW
        ],
    },
    Health: {
        name: "health",
        icon: "🧘‍♂️",
        bgColor: "bg-lime-500",
        subcategories: [],
        blocks: [
            Blocks.PHYSIO,
            Blocks.YOGA,
            Blocks.POWER,
            Blocks.CARDIO,
        ],
    },
    Household: {
        name: "household",
        icon: "🏠",
        bgColor: "bg-orange-700",
        subcategories: [],
        blocks: [
            Blocks.LAUNDRY,
            Blocks.COOK,
            Blocks.ORGANIZE,
            Blocks.CLEAN,
            Blocks.SHEETS,
            Blocks.TOWELS,
        ],
    },
    Family: {
        name: "family",
        icon: "☀️",
        bgColor: "bg-rose-600",
        subcategories: ["WhatsApp", "call", "meet", "date"],
        blocks: [
            Blocks.DAD,
            Blocks.MOM,
            Blocks.GRANDMA,
            Blocks.GRANDPA,
            Blocks.OR,
            Blocks.SAHAR,
            Blocks.SHACHAR,
            Blocks.OFEK,
            Blocks.YAHEL,
        ],
    },
    Friends: {
        name: "friends",
        icon: "🌳",
        bgColor: "bg-sky-500",
        subcategories: ["WhatsApp", "call", "meet", "date"],
        blocks: [
            Blocks.MAYA,
            Blocks.ODELIA,
            Blocks.NATI,
            Blocks.OFIR,
            Blocks.DAVID,
            Blocks.JULIA,
            Blocks.ROTEM,
        ],
    },
    Avoid: {
        name: "avoid",
        icon: "🚫",
        bgColor: "bg-zinc-500",
        blocks: [Blocks.DOOM_SCROLL],
        subcategories: []
    },
    // Testosterone: { name: "Testosterone", icon: "⚡️", subcategories: [] },
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
    "2026-01": "Dad to Noga 🥰",
    "2025-12": "Job Hunt + GameIS Petition",
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

