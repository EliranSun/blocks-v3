
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
    GRUNT: "grunt",

    // creative
    PLAY: "play",
    READ: "read",
    CODE: "code",
    WATCH: "watch",
    DRAW: "draw",
    CSS: "css",

    // health
    FAT: "fat",
    WEIGHT: "weight",
    PHYSIO: "physio",
    YOGA: "yoga",
    POWER: "power",
    CARDIO: "cardio",
    THERAPY: "therapy",
    MASSAGE: "massage",
    BARBER: "barber",

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
    BAR_ZAKAI: "bar zakai",

    // friends
    MAYA: "maya",
    ODELIA: "odelia",
    NATI: "nati",
    OFIR: "ofir",
    DAVID: "david",
    JULIA: "julia",
    ROTEM: "rotem",
    FRIENDS_OTHER: "other",

    // household
    LAUNDRY: "laundry",
    COOK: "cook",
    ORGANIZE: "organize",
    CLEAN: "clean",
    TOWELS: "towels",
    SHEETS: "sheets",
    PLANTS: "plants",
    DISHES: "dishes",
    GROCERIES: "groceries",

    // avoid
    DOOM_SCROLL: "doom scroll",
    SICK: "sick",
    PORN: "porn",

    // Mood
    GREAT: "😀",
    GOOD: "🙂",
    OK: "😐",
    BAD: "🙁",
    AWFUL: "😭"
}

export const Categories = {
    Mood: {
        name: "mood",
        icon: "🧐",
        bgColor: "bg-(--brut-fg) text-(--brut-bg)",
        color: "text-(--brut-fg)",
        subcategories: [],
        blocks: [
            Blocks.GREAT,
            Blocks.GOOD,
            Blocks.OK,
            Blocks.BAD,
            Blocks.AWFUL
        ],
    },
    Wife: {
        name: "wife",
        icon: "❤️",
        bgColor: "bg-brut-pink text-brut-ink",
        color: "text-brut-pink",
        subcategories: [],
        blocks: [
            Blocks.DATE,
            Blocks.TRIP,
            Blocks.GESTURES,
            Blocks.SEX,
            Blocks.GRUNT
        ],
    },
    Creative: {
        name: "creative",
        icon: "🎨",
        bgColor: "bg-brut-orange text-brut-ink",
        color: "text-brut-orange",
        subcategories: [],
        blocks: [
            Blocks.PLAY,
            Blocks.READ,
            Blocks.CODE,
            Blocks.WATCH,
            Blocks.DRAW,
            Blocks.CSS
        ],
    },
    Health: {
        name: "health",
        icon: "🧘‍♂️",
        bgColor: "bg-brut-lime text-brut-ink",
        color: "text-brut-lime",
        subcategories: [],
        blocks: [
            Blocks.WEIGHT,
            Blocks.FAT,
            Blocks.PHYSIO,
            Blocks.YOGA,
            Blocks.POWER,
            Blocks.CARDIO,
            Blocks.THERAPY,
            Blocks.MASSAGE,
            Blocks.BARBER,
        ],
    },
    Household: {
        name: "household",
        icon: "🏠",
        bgColor: "bg-brut-yellow text-brut-ink",
        color: "text-brut-yellow",
        subcategories: [],
        blocks: [
            Blocks.LAUNDRY,
            Blocks.COOK,
            Blocks.ORGANIZE,
            Blocks.CLEAN,
            Blocks.SHEETS,
            Blocks.TOWELS,
            Blocks.PLANTS,
            Blocks.DISHES,
            Blocks.GROCERIES,
        ],
    },
    Family: {
        name: "family",
        icon: "☀️",
        bgColor: "bg-brut-red text-brut-ink",
        color: "text-brut-red",
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
            Blocks.BAR_ZAKAI,
        ],
    },
    Friends: {
        name: "friends",
        icon: "🌳",
        bgColor: "bg-brut-blue text-brut-ink",
        color: "text-brut-blue",
        subcategories: ["WhatsApp", "call", "meet", "date"],
        blocks: [
            Blocks.MAYA,
            Blocks.ODELIA,
            Blocks.NATI,
            Blocks.OFIR,
            Blocks.DAVID,
            Blocks.JULIA,
            Blocks.ROTEM,
            Blocks.FRIENDS_OTHER,
        ],
    },
    Avoid: {
        name: "avoid",
        icon: "🚫",
        bgColor: "bg-zinc-500 text-white",
        color: "text-zinc-500",
        blocks: [Blocks.DOOM_SCROLL, Blocks.SICK, Blocks.PORN, Blocks.GRUNT],
        subcategories: []
    },
    // Testosterone: { name: "Testosterone", icon: "⚡️", subcategories: [] },
};

export const CategoryColors = {
    mood: "text-(--brut-fg)",
    creative: "text-brut-orange",
    health: "text-brut-lime",
    testosterone: "text-brut-cyan",
    household: "text-brut-yellow",
    family: "text-brut-red",
    friends: "text-brut-blue",
    wife: "text-brut-pink",
    avoid: "text-zinc-500",
};

export const CategoryBgColors = {
    mood: "bg-(--brut-fg) text-(--brut-bg)",
    creative: "bg-brut-orange text-brut-ink",
    health: "bg-brut-lime text-brut-ink",
    testosterone: "bg-brut-cyan text-brut-ink",
    household: "bg-brut-yellow text-brut-ink",
    family: "bg-brut-red text-brut-ink",
    friends: "bg-brut-blue text-brut-ink",
    wife: "bg-brut-pink text-brut-ink",
    avoid: "bg-zinc-500 text-white",
};

export const CategoryHex = {
    light: {
        mood: "#0a0a0a",
        creative: "#ff6a00",
        health: "#29b04a",
        household: "#ffb400",
        family: "#ff2e2e",
        friends: "#2b7fff",
        wife: "#ff4dd2",
        avoid: "#6b6b6b",
        testosterone: "#00bfa6",
    },
    dark: {
        mood: "#f5f5f5",
        creative: "#ff8a3d",
        health: "#6ee07f",
        household: "#ffd24d",
        family: "#ff7676",
        friends: "#6aa9ff",
        wife: "#ff8be3",
        avoid: "#a3a3a3",
        testosterone: "#5eead4",
    },
};

export const MonthNotes = {
    "2026-03": "Tikal, Elementor & the 'Great' Plateau",
    "2026-02": "Dad to Noga; Pre-Tikal; CSS prototype",
    "2026-01": "Noga's Birth 🥰; Grandpa's Death 😢",
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

