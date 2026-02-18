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

export const BlocksDataView = ({ data = [], onBlockClick }) => {
    return (
        <div className="space-y-2 pb-40">
            <motion.h1
                className="text-xl merriweather-900"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
            >
                BLOCKS DATA
            </motion.h1>
            {Object.values(Categories).map((category, catIndex) => {
                return (
                    <motion.div
                        key={category.name}
                        custom={catIndex}
                        variants={categorySectionVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <h2 className="text-lg uppercase py-2 font-bold underline merriweather-500">
                            {category.name}
                        </h2>
                        <motion.div
                            variants={blockListVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {category.blocks.map(block => {
                                const blocks = data
                                    .filter(item => {
                                        return (
                                            item.name.toLowerCase().trim().includes(block.toLowerCase().trim()) ||
                                            item.category.toLowerCase().trim() === block.toLowerCase().trim() ||
                                            item.subcategory?.toLowerCase().trim() === block.toLowerCase().trim()
                                        )
                                    })

                                return (
                                    <motion.button
                                        key={block}
                                        className={classNames("my-2 flex w-full text-left cursor-pointer")}
                                        variants={blockRowVariants}
                                        whileHover={{ x: 4 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                        onClick={() => onBlockClick?.(block)}
                                    >
                                        <h3 className={classNames(category.color, "space-grotesk-600 w-28 font-bold uppercase shrink-0")}>
                                            {block}
                                        </h3>
                                        <div className="flex gap-1 merriweather-400">
                                            {blocks.length ? (
                                                <span className="">
                                                    {[
                                                        timeAgo(blocks.at(0)?.date),
                                                        blocks.length + " times"
                                                    ].filter(Boolean).join(", ")}
                                                </span>
                                            ) : "None"}
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
