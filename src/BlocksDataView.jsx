import classNames from "classnames";
import { Categories } from "./constants";
import { formatDistanceToNow, format } from 'date-fns';
import { motion } from "framer-motion";

const timeAgo = date => {
    if (!date) return "None";

    try {
        return formatDistanceToNow(new Date(date), { addSuffix: false })
    } catch (error) {
        console.error(error);
    }

    return date;
};

const categorySectionVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: i * 0.08,
            type: "spring",
            damping: 20,
            stiffness: 300,
        },
    }),
};

const blockRowVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            type: "spring",
            damping: 20,
            stiffness: 300,
        },
    },
};

const blockListVariants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.03,
        },
    },
};

export const BlocksDataView = ({ data = [], onBlockClick, onCategoryClick }) => {
    return (
        <div className="space-y-4 pb-40">
            <motion.h1
                className="text-4xl uppercase tracking-tight"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 900 }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 800, damping: 22, mass: 0.5 }}
            >
                Blocks Data
            </motion.h1>
            {Object.values(Categories).map((category, catIndex) => {
                return (
                    <motion.div
                        key={category.name}
                        custom={catIndex}
                        variants={categorySectionVariants}
                        initial="hidden"
                        animate="visible"
                        className="brut-card p-3"
                    >
                        <motion.button
                            className={classNames(
                                "flex items-center gap-2 px-3 py-2 w-full text-left brut-border brut-shadow-sm uppercase",
                                category.bgColor
                            )}
                            whileHover={{ x: -2, y: -2 }}
                            whileTap={{ x: 2, y: 2 }}
                            transition={{ type: "spring", stiffness: 800, damping: 22, mass: 0.5 }}
                            onClick={() => onCategoryClick?.(category.name)}
                        >
                            <span className="text-base">{category.icon}</span>
                            <h2 className="text-lg font-black tracking-wide" style={{ fontFamily: 'var(--font-display)' }}>
                                {category.name}
                            </h2>
                        </motion.button>
                        <motion.div
                            variants={blockListVariants}
                            initial="hidden"
                            animate="visible"
                            className="mt-2"
                        >
                            {category.blocks.map(block => {
                                const blocks = data
                                    .filter(item => {
                                        return (
                                            item.name.toLowerCase().trim() === block.toLowerCase().trim() ||
                                            item.category.toLowerCase().trim() === block.toLowerCase().trim() ||
                                            item.subcategory?.toLowerCase().trim() === block.toLowerCase().trim()
                                        )
                                    })

                                return (
                                    <motion.button
                                        key={block}
                                        className="my-1 flex w-full text-left cursor-pointer items-baseline border-b-2 border-(--brut-border)/20 py-1"
                                        variants={blockRowVariants}
                                        whileHover={{ x: 4 }}
                                        transition={{ type: "spring", stiffness: 800, damping: 22, mass: 0.5 }}
                                        onClick={() => onBlockClick?.(block)}
                                    >
                                        <h3 className={classNames(category.color, "w-28 font-bold uppercase tracking-wide shrink-0 text-sm")}>
                                            {block}
                                        </h3>
                                        <div className="flex gap-1 min-w-0 overflow-hidden text-sm">
                                            {blocks.length ? (
                                                <span className="truncate">
                                                    <span className="font-black">{blocks.length}×</span> · {timeAgo(blocks.at(0)?.date)}
                                                </span>
                                            ) : <span className="opacity-50">None</span>}
                                        </div>
                                    </motion.button>
                                )
                            })}
                        </motion.div>
                    </motion.div>
                );
            })}
        </div>
    )
}
