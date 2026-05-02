import { useState } from "react";
import classNames from "classnames";
import { motion } from "framer-motion";
import { X, List, Calendar, CalendarDays, CalendarRange, FileText, Layers, FolderOpen, Settings2 } from "lucide-react";
import { Popover } from "./Popover";
import { Categories } from "./constants";

const categoryList = Object.values(Categories);

const viewOptions = [
    { key: "list", icon: List, label: "List" },
    { key: "year", icon: Calendar, label: "Year" },
    { key: "week", icon: CalendarDays, label: "Week" },
];

const listScopeOptions = [
    { key: "all", label: "All" },
    { key: "year", label: "Year" },
    { key: "month", label: "Month" },
    { key: "week", label: "Week" },
];

const toggleOptions = [
    { key: "showDate",        icon: CalendarRange, label: "Dates" },
    { key: "showNote",        icon: FileText,      label: "Notes" },
    { key: "showColorOnly",   icon: Layers,        label: "Color only" },
    { key: "showSubcategory", icon: FolderOpen,    label: "Subcategory" },
];

const NEO_TILE = classNames(
    "relative w-full select-none cursor-pointer rounded-sm",
    "border-[3px] border-black dark:border-white",
    "shadow-[5px_5px_0_0_#000] dark:shadow-[5px_5px_0_0_#fff]",
    "active:shadow-[1px_1px_0_0_#000] dark:active:shadow-[1px_1px_0_0_#fff]",
    "active:translate-x-[4px] active:translate-y-[4px]",
    "transition-[transform,box-shadow] duration-75",
    "flex items-center justify-between gap-3 px-4 py-3",
    "font-black uppercase tracking-tight space-grotesk-600 text-base",
);

const NEO_TILE_SMALL = classNames(
    "relative select-none cursor-pointer rounded-sm",
    "border-[3px] border-black dark:border-white",
    "shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff]",
    "active:shadow-[1px_1px_0_0_#000] dark:active:shadow-[1px_1px_0_0_#fff]",
    "active:translate-x-[3px] active:translate-y-[3px]",
    "transition-[transform,box-shadow] duration-75",
    "flex items-center justify-center gap-2 px-3 py-2",
    "font-black uppercase tracking-tight space-grotesk-600 text-sm",
);

const NEO_TRIGGER = classNames(
    "select-none cursor-pointer rounded-sm",
    "border-[3px] border-black dark:border-white",
    "shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff]",
    "active:shadow-[1px_1px_0_0_#000] dark:active:shadow-[1px_1px_0_0_#fff]",
    "active:translate-x-[3px] active:translate-y-[3px]",
    "transition-[transform,box-shadow] duration-75",
    "flex items-center justify-center gap-2 px-3 py-2",
    "font-black uppercase tracking-tight space-grotesk-600 text-sm",
);


export const ModalShell = ({ title, onClose, children }) => (
    <div className="flex flex-col h-full relative">
        <div className="absolute top-0 right-0 z-10">
            <motion.button
                type="button"
                aria-label="Close"
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
            {title}
        </h2>
        <div className="overflow-y-auto pr-1">
            {children}
        </div>
    </div>
);

export const Tile = ({ active, onClick, children, ariaCurrent }) => (
    <motion.button
        type="button"
        whileHover={{ translateX: -1, translateY: -1 }}
        onClick={onClick}
        className={classNames(
            NEO_TILE,
            active
                ? "bg-amber-400 text-black"
                : "bg-white text-black dark:bg-neutral-800 dark:text-white",
        )}
        aria-current={ariaCurrent}
    >
        {children}
    </motion.button>
);

const ViewModal = ({ isOpen, onClose, view, onViewChange, listScope, onListScopeChange }) => (
    <Popover isOpen={isOpen}>
        <ModalShell title="View" onClose={onClose}>
            <div className="flex flex-col gap-4">
                {viewOptions.map(({ key, icon: ViewIcon, label }) => {
                    const active = view === key;
                    return (
                        <Tile
                            key={key}
                            active={active}
                            ariaCurrent={active ? "true" : undefined}
                            onClick={() => {
                                onViewChange(key);
                                onClose();
                            }}
                        >
                            <span className="flex items-center gap-3">
                                <ViewIcon size={22} strokeWidth={2.5} />
                                <span>{label}</span>
                            </span>
                            {active && (
                                <span className="text-[10px] tracking-widest font-bold border-[2px] border-black px-2 py-1 rounded-sm">
                                    CURRENT
                                </span>
                            )}
                        </Tile>
                    );
                })}
            </div>
            {view === "list" && (
                <div className="mt-6">
                    <h3 className="text-sm font-black uppercase tracking-widest space-grotesk-600 mb-3">
                        Scope
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        {listScopeOptions.map(({ key, label }) => {
                            const active = listScope === key;
                            return (
                                <motion.button
                                    key={key}
                                    type="button"
                                    whileHover={{ translateX: -1, translateY: -1 }}
                                    onClick={() => {
                                        onListScopeChange(key);
                                        onClose();
                                    }}
                                    className={classNames(
                                        NEO_TILE_SMALL,
                                        active
                                            ? "bg-amber-400 text-black"
                                            : "bg-white text-black dark:bg-neutral-800 dark:text-white",
                                    )}
                                    aria-current={active ? "true" : undefined}
                                >
                                    {label}
                                </motion.button>
                            );
                        })}
                    </div>
                </div>
            )}
        </ModalShell>
    </Popover>
);

export const CategoryModal = ({ isOpen, onClose, category, onCategoryChange }) => (
    <Popover isOpen={isOpen}>
        <ModalShell title="Category" onClose={onClose}>
            <div className="flex flex-col gap-3">
                <Tile
                    active={!category}
                    ariaCurrent={!category ? "true" : undefined}
                    onClick={() => {
                        onCategoryChange(null);
                        onClose();
                    }}
                >
                    <span className="flex items-center gap-3">
                        <span className="text-2xl leading-none">*</span>
                        <span>All</span>
                    </span>
                    {!category && (
                        <span className="text-[10px] tracking-widest font-bold border-[2px] border-black px-2 py-1 rounded-sm">
                            CURRENT
                        </span>
                    )}
                </Tile>
                {categoryList.map(({ name, icon: CatIcon }) => {
                    const active = category === name;
                    return (
                        <Tile
                            key={name}
                            active={active}
                            ariaCurrent={active ? "true" : undefined}
                            onClick={() => {
                                onCategoryChange(active ? null : name);
                                onClose();
                            }}
                        >
                            <span className="flex items-center gap-3">
                                <CatIcon size={22} strokeWidth={2.5} />
                                <span>{name}</span>
                            </span>
                            {active && (
                                <span className="text-[10px] tracking-widest font-bold border-[2px] border-black px-2 py-1 rounded-sm">
                                    CURRENT
                                </span>
                            )}
                        </Tile>
                    );
                })}
            </div>
        </ModalShell>
    </Popover>
);

const DisplayModal = ({ isOpen, onClose, toggles, onToggle }) => (
    <Popover isOpen={isOpen}>
        <ModalShell title="Display" onClose={onClose}>
            <div className="flex flex-col gap-3">
                {toggleOptions.map(({ key, icon: ToggleIcon, label }) => {
                    const active = !!toggles[key];
                    return (
                        <Tile
                            key={key}
                            active={active}
                            ariaCurrent={active ? "true" : undefined}
                            onClick={() => onToggle(key)}
                        >
                            <span className="flex items-center gap-3">
                                <ToggleIcon size={22} strokeWidth={2.5} />
                                <span>{label}</span>
                            </span>
                            <span
                                className={classNames(
                                    "text-[10px] tracking-widest font-bold border-[2px] border-black px-2 py-1 rounded-sm",
                                    active ? "bg-black text-amber-400" : "bg-white text-black",
                                )}
                            >
                                {active ? "ON" : "OFF"}
                            </span>
                        </Tile>
                    );
                })}
            </div>
        </ModalShell>
    </Popover>
);

const TriggerButton = ({ active, onClick, children }) => (
    <motion.button
        type="button"
        whileHover={{ translateX: -1, translateY: -1 }}
        onClick={onClick}
        className={classNames(
            NEO_TRIGGER,
            active
                ? "bg-amber-400 text-black"
                : "bg-white text-black dark:bg-neutral-800 dark:text-white",
        )}
    >
        {children}
    </motion.button>
);

export const BlocksToolbar = ({
    view,
    onViewChange,
    category,
    onCategoryChange,
    listScope,
    onListScopeChange,
    toggles,
    onToggle,
}) => {
    const [openModal, setOpenModal] = useState(null);
    const close = () => setOpenModal(null);

    const activeView = viewOptions.find(v => v.key === view);
    const activeCategory = category
        ? categoryList.find(c => c.name === category)
        : null;
    const activeToggleKeys = toggleOptions.filter(t => toggles[t.key]);

    const ActiveViewIcon = activeView?.icon ?? List;
    const ActiveCatIcon = activeCategory?.icon ?? null;

    return (
        <>
            <div className="flex gap-3 items-center flex-wrap">
                <TriggerButton
                    active={false}
                    onClick={() => setOpenModal("view")}
                >
                    <ActiveViewIcon size={18} strokeWidth={2.5} />
                    <span>{activeView?.label ?? "View"}</span>
                </TriggerButton>
                <TriggerButton
                    active={!!category}
                    onClick={() => setOpenModal("category")}
                >
                    {ActiveCatIcon ? <ActiveCatIcon size={18} strokeWidth={2.5} /> : <span>*</span>}
                    <span>{activeCategory?.name ?? "All"}</span>
                </TriggerButton>
                <TriggerButton
                    active={activeToggleKeys.length > 0}
                    onClick={() => setOpenModal("display")}
                >
                    {activeToggleKeys.length > 0 ? (
                        <span className="flex items-center gap-1">
                            {activeToggleKeys.map(t => {
                                const TIcon = t.icon;
                                return <TIcon key={t.key} size={18} strokeWidth={2.5} />;
                            })}
                        </span>
                    ) : (
                        <>
                            <Settings2 size={18} strokeWidth={2.5} />
                            <span>Display</span>
                        </>
                    )}
                </TriggerButton>
            </div>
            <ViewModal
                isOpen={openModal === "view"}
                onClose={close}
                view={view}
                onViewChange={onViewChange}
                listScope={listScope}
                onListScopeChange={onListScopeChange}
            />
            <CategoryModal
                isOpen={openModal === "category"}
                onClose={close}
                category={category}
                onCategoryChange={onCategoryChange}
            />
            <DisplayModal
                isOpen={openModal === "display"}
                onClose={close}
                toggles={toggles}
                onToggle={onToggle}
            />
        </>
    );
};
