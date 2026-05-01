import classNames from "classnames";
import { motion } from "framer-motion";
import { X, LayoutGrid, Database, TrendingUp } from "lucide-react";
import { Popover } from "./Popover";

const NAV_ITEMS = [
    { key: "",           label: "Blocks",   icon: LayoutGrid },
    { key: "blocksData", label: "Data",     icon: Database },
    { key: "insights",   label: "Insights", icon: TrendingUp },
];

const isActiveKey = (currentPage, key) => {
    if (key === "blocksData") {
        return (
            currentPage === "blocksData" ||
            currentPage === "blockDetail" ||
            currentPage === "categoryDetail"
        );
    }
    return currentPage === key;
};


const NEO_NAV_TILE = classNames(
    "relative w-full select-none cursor-pointer rounded-sm",
    "border-[3px] border-black dark:border-white",
    "shadow-[5px_5px_0_0_#000] dark:shadow-[5px_5px_0_0_#fff]",
    "active:shadow-[1px_1px_0_0_#000] dark:active:shadow-[1px_1px_0_0_#fff]",
    "active:translate-x-[4px] active:translate-y-[4px]",
    "transition-[transform,box-shadow] duration-75",
    "flex items-center justify-between gap-3 px-5 py-5",
    "font-black uppercase tracking-tight space-grotesk-600 text-xl",
);

export const NavMenu = ({ isOpen, onClose, currentPage, onNavigate }) => (
    <Popover isOpen={isOpen}>
        <div className="flex flex-col h-full relative">
            <div className="absolute top-0 right-0 z-10">
                <motion.button
                    type="button"
                    aria-label="Close menu"
                    onClick={onClose}
                    whileTap={{ translateX: 3, translateY: 3, boxShadow: "1px 1px 0 0 #000" }}
                    className={classNames(
                        "w-10 h-10 flex items-center justify-center rounded-sm",
                        "border-[3px] border-black dark:border-white",
                        "bg-white text-black dark:bg-neutral-800 dark:text-white",
                        "shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff]",
                        "transition-[transform,box-shadow] duration-75",
                    )}
                >
                    <X size={20} strokeWidth={3} />
                </motion.button>
            </div>
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight space-grotesk-600 leading-none mb-6 pr-12">
                Navigate
            </h2>
            <div className="flex flex-col gap-4">
                {NAV_ITEMS.map(({ key, label, icon: NavIcon }) => {
                    const active = isActiveKey(currentPage, key);
                    return (
                        <motion.button
                            key={key || "blocks"}
                            type="button"
                            whileHover={{ translateX: -1, translateY: -1 }}
                            onClick={() => {
                                onNavigate(key);
                                onClose();
                            }}
                            className={classNames(
                                NEO_NAV_TILE,
                                active
                                    ? "bg-amber-400 text-black"
                                    : "bg-white text-black dark:bg-neutral-800 dark:text-white",
                            )}
                            aria-current={active ? "page" : undefined}
                        >
                            <span className="flex items-center gap-3">
                                <NavIcon size={24} strokeWidth={2.5} />
                                <span>{label}</span>
                            </span>
                            {active && (
                                <span className="text-[10px] tracking-widest font-bold border-[2px] border-black px-2 py-1 rounded-sm">
                                    CURRENT
                                </span>
                            )}
                        </motion.button>
                    );
                })}
            </div>
        </div>
    </Popover>
);
