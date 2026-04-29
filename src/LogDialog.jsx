import { useState, useEffect, useRef, useMemo } from "react";
import confetti from "canvas-confetti";

import { Popover } from "./Popover";
import { Categories } from "./constants";
import classNames from "classnames";
import { motion, AnimatePresence } from "framer-motion";

const categoryArray = Object.values(Categories);

const getInitialCategory = (log) => {
    if (log?.category) {
        const found = categoryArray.find(c => c.name.toLowerCase() === log.category.toLowerCase());
        return found || null;
    }
    return null;
};

const NEO_TILE_BASE =
    "relative select-none cursor-pointer rounded-sm border-[3px] border-black " +
    "shadow-[5px_5px_0_0_#000] active:shadow-[1px_1px_0_0_#000] " +
    "active:translate-x-[4px] active:translate-y-[4px] transition-[transform,box-shadow] duration-75 " +
    "flex flex-col items-center justify-center font-bold uppercase tracking-tight";

const NEO_INPUT =
    "w-full px-4 py-3 text-base font-semibold rounded-sm bg-white text-black " +
    "border-[3px] border-black shadow-[4px_4px_0_0_#000] " +
    "focus:outline-none focus:shadow-[6px_6px_0_0_#000] focus:-translate-x-[2px] focus:-translate-y-[2px] " +
    "transition-[transform,box-shadow] placeholder:text-neutral-500";

const fireConfetti = () => {
    const defaults = {
        spread: 360,
        ticks: 70,
        gravity: 0.8,
        decay: 0.92,
        startVelocity: 25,
        colors: ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#5f27cd', '#000000'],
    };
    confetti({ ...defaults, particleCount: 50, scalar: 1.3, shapes: ['square'], origin: { x: 0.5, y: 0.4 } });
    confetti({ ...defaults, particleCount: 30, scalar: 0.9, shapes: ['circle'], origin: { x: 0.5, y: 0.4 } });
};

const formatDateForInput = (value) => {
    if (!value) return new Date().toISOString().slice(0, 16);
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    date.setHours(date.getHours() + 4);
    return date.toISOString().slice(0, 16);
};

const stepFade = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.12, ease: "easeOut" },
};

const IconX = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
        <line x1="6" y1="6" x2="18" y2="18" />
        <line x1="18" y1="6" x2="6" y2="18" />
    </svg>
);

const IconTrash = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        <path d="M10 11v6M14 11v6" />
        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
);

const IconChevron = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6" />
    </svg>
);

const StepHeading = ({ children }) => (
    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight space-grotesk-600 leading-none mb-5">
        {children}
    </h2>
);

const Tile = ({ onClick, selected, color, children, size = "md", pulse }) => {
    const sizeClass = size === "lg" ? "h-28 text-base px-3" : "h-20 text-sm px-3";
    const bg = selected ? color : "bg-white";
    const text = selected ? "text-white" : "text-black";
    return (
        <motion.button
            type="button"
            onClick={onClick}
            whileHover={{ translateX: -1, translateY: -1 }}
            animate={pulse ? { scale: [1, 1.08, 1] } : { scale: 1 }}
            transition={{ duration: 0.16 }}
            className={classNames(NEO_TILE_BASE, sizeClass, bg, text)}
        >
            {children}
        </motion.button>
    );
};

const Chip = ({ onClick, color = "bg-white", children, label }) => (
    <button
        type="button"
        onClick={onClick}
        className={classNames(
            "inline-flex items-center gap-2 px-3 py-1.5 rounded-sm border-[3px] border-black",
            "shadow-[3px_3px_0_0_#000] active:shadow-[1px_1px_0_0_#000] active:translate-x-[2px] active:translate-y-[2px]",
            "transition-[transform,box-shadow] duration-75 font-bold text-sm",
            color,
            color === "bg-white" ? "text-black" : "text-white",
        )}
    >
        {label && <span className="text-[10px] uppercase tracking-widest opacity-80">{label}</span>}
        <span className="uppercase tracking-tight">{children}</span>
        <IconChevron />
    </button>
);

const IconButton = ({ onClick, color = "bg-white", ariaLabel, children }) => (
    <motion.button
        type="button"
        aria-label={ariaLabel}
        onClick={onClick}
        whileTap={{ translateX: 3, translateY: 3, boxShadow: "1px 1px 0 0 #000" }}
        className={classNames(
            "w-10 h-10 flex items-center justify-center rounded-sm border-[3px] border-black",
            "shadow-[4px_4px_0_0_#000] transition-[transform,box-shadow] duration-75",
            color,
            color === "bg-white" ? "text-black" : "text-white",
        )}
    >
        {children}
    </motion.button>
);

const LogDialogInner = ({ log, defaultDate, onClose, onAdd, onEdit, onDelete }) => {
    const isEditMode = Boolean(log?._id);
    const [selectedCategory, setSelectedCategory] = useState(() => getInitialCategory(log));
    const [blockName, setBlockName] = useState(log?.name?.toLowerCase() || "");
    const [subcategory, setSubcategory] = useState(log?.subcategory || "");
    const [note, setNote] = useState(log?.note || "");
    const [thought, setThought] = useState(log?.thought || "");
    const [dateValue, setDateValue] = useState(() =>
        formatDateForInput(log?.date || defaultDate || new Date().toISOString())
    );
    const [step, setStep] = useState(isEditMode ? "review" : "category");
    const [showOptional, setShowOptional] = useState(
        Boolean(log?.note || log?.thought)
    );
    const [pulseKey, setPulseKey] = useState(null);
    const debounceRef = useRef(null);
    const skipDebounceRef = useRef(true);

    useEffect(() => {
        if (!isEditMode || !log?._id) return;
        if (skipDebounceRef.current) {
            skipDebounceRef.current = false;
            return;
        }
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            onEdit(log._id, {
                note,
                thought,
                date: dateValue,
            });
            setPulseKey(`opt-${Date.now()}`);
        }, 600);
        return () => clearTimeout(debounceRef.current);
    }, [note, thought, dateValue, isEditMode, log?._id, onEdit]);

    const resetAndClose = () => {
        clearTimeout(debounceRef.current);
        setSelectedCategory(null);
        setBlockName("");
        setSubcategory("");
        setNote("");
        setThought("");
        setShowOptional(false);
        setStep("category");
        onClose();
    };

    const commitAdd = (overrides = {}) => {
        const payload = {
            category: (overrides.category ?? selectedCategory?.name) || "",
            name: overrides.name ?? blockName,
            date: dateValue || formatDateForInput(defaultDate || new Date().toISOString()),
        };
        const sub = overrides.subcategory ?? subcategory;
        if (sub) payload.subcategory = sub;
        if (note) payload.note = note;
        if (thought) payload.thought = thought;
        if (!payload.category || !payload.name) return;
        onAdd(payload);
        fireConfetti();
        resetAndClose();
    };

    const handleCategoryPick = (key, category) => {
        if (isEditMode) {
            const patch = { category: category.name };
            const sameCategoryAlready = selectedCategory?.name === category.name;
            if (!sameCategoryAlready) {
                setBlockName("");
                setSubcategory("");
                patch.name = "";
                patch.subcategory = "";
            }
            setSelectedCategory(category);
            onEdit(log._id, patch);
            setPulseKey(`cat-${key}`);
            setStep(category.blocks.length ? "block" : "review");
            return;
        }
        setSelectedCategory(category);
        setBlockName("");
        setSubcategory("");
        setStep("block");
    };

    const handleBlockPick = (block) => {
        if (isEditMode) {
            setBlockName(block);
            onEdit(log._id, { name: block });
            setPulseKey(`block-${block}`);
            if (selectedCategory?.subcategories?.length) {
                setStep("type");
            } else {
                setStep("review");
            }
            return;
        }
        setBlockName(block);
        if (selectedCategory?.subcategories?.length) {
            setStep("type");
        } else {
            commitAdd({ name: block });
        }
    };

    const handleTypePick = (sub) => {
        if (isEditMode) {
            setSubcategory(sub);
            onEdit(log._id, { subcategory: sub });
            setPulseKey(`sub-${sub}`);
            setStep("review");
            return;
        }
        setSubcategory(sub);
        commitAdd({ subcategory: sub });
    };

    const handleDelete = () => {
        if (isEditMode && onDelete) {
            onDelete(log._id);
            resetAndClose();
        }
    };

    const accent = selectedCategory?.bgColor || "bg-yellow-300";

    const breadcrumb = useMemo(() => {
        if (step === "category") return null;
        return (
            <div className="flex flex-wrap gap-2 mb-4">
                {selectedCategory && (
                    <Chip
                        label="cat"
                        color={selectedCategory.bgColor}
                        onClick={() => setStep("category")}
                    >
                        {selectedCategory.icon} {selectedCategory.name}
                    </Chip>
                )}
                {step !== "block" && blockName && (
                    <Chip onClick={() => setStep("block")} label="block">
                        {blockName}
                    </Chip>
                )}
                {step === "review" && subcategory && (
                    <Chip onClick={() => setStep("type")} label="type">
                        {subcategory}
                    </Chip>
                )}
            </div>
        );
    }, [step, selectedCategory, blockName, subcategory]);

    return (
            <div className="flex flex-col h-full relative">
                <div className="absolute top-0 right-0 flex gap-2 z-10">
                    {isEditMode && (
                        <IconButton color="bg-red-400" ariaLabel="Delete block" onClick={handleDelete}>
                            <IconTrash />
                        </IconButton>
                    )}
                    <IconButton ariaLabel="Close dialog" onClick={onClose}>
                        <IconX />
                    </IconButton>
                </div>

                <div className="flex-1 overflow-y-auto overflow-x-hidden pr-1 pt-14">
                    <AnimatePresence mode="wait">
                        {step === "category" && (
                            <motion.div key="step-category" {...stepFade}>
                                <StepHeading>Pick a category</StepHeading>
                                <div className="grid grid-cols-3 gap-3">
                                    {Object.entries(Categories).map(([key, category]) => {
                                        const isSelected = selectedCategory?.name === category.name;
                                        return (
                                            <Tile
                                                key={key}
                                                size="lg"
                                                color={category.bgColor}
                                                selected={isSelected}
                                                pulse={pulseKey === `cat-${key}`}
                                                onClick={() => handleCategoryPick(key, category)}
                                            >
                                                <span className="text-4xl mb-1">{category.icon}</span>
                                                <span className="text-xs">{key}</span>
                                            </Tile>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}

                        {step === "block" && selectedCategory && (
                            <motion.div key="step-block" {...stepFade}>
                                {breadcrumb}
                                <StepHeading>Pick a block</StepHeading>
                                <div className="grid grid-cols-3 gap-3">
                                    {selectedCategory.blocks.map((block) => {
                                        const isSelected = blockName === block;
                                        return (
                                            <Tile
                                                key={block}
                                                color={selectedCategory.bgColor}
                                                selected={isSelected}
                                                pulse={pulseKey === `block-${block}`}
                                                onClick={() => handleBlockPick(block)}
                                            >
                                                <span className="leading-tight text-center break-words">{block}</span>
                                            </Tile>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}

                        {step === "type" && selectedCategory?.subcategories?.length > 0 && (
                            <motion.div key="step-type" {...stepFade}>
                                {breadcrumb}
                                <StepHeading>Pick a type</StepHeading>
                                <div className="grid grid-cols-2 gap-3">
                                    {selectedCategory.subcategories.map((sub) => {
                                        const isSelected = subcategory === sub;
                                        return (
                                            <Tile
                                                key={sub}
                                                color={selectedCategory.bgColor}
                                                selected={isSelected}
                                                pulse={pulseKey === `sub-${sub}`}
                                                onClick={() => handleTypePick(sub)}
                                            >
                                                <span>{sub}</span>
                                            </Tile>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}

                        {step === "review" && isEditMode && (
                            <motion.div key="step-review" {...stepFade}>
                                <StepHeading>Edit block</StepHeading>
                                {breadcrumb}
                                <p className="text-xs uppercase tracking-widest font-bold text-neutral-700 mt-6">
                                    Tap any chip above to change. Edits save automatically.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="mt-8">
                        <button
                            type="button"
                            onClick={() => setShowOptional(v => !v)}
                            className={classNames(
                                "inline-flex items-center gap-2 px-3 py-2 rounded-sm",
                                "border-[3px] border-black bg-white text-black font-bold uppercase text-xs tracking-widest",
                                "shadow-[4px_4px_0_0_#000] active:shadow-[1px_1px_0_0_#000] active:translate-x-[3px] active:translate-y-[3px] transition-[transform,box-shadow] duration-75"
                            )}
                        >
                            <span className="text-base leading-none">{showOptional ? "−" : "+"}</span>
                            More options
                        </button>

                        <AnimatePresence initial={false}>
                            {showOptional && (
                                <motion.div
                                    key="optional"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.18, ease: "easeOut" }}
                                    className="overflow-hidden"
                                >
                                    <div className="pt-4 space-y-3">
                                        <input
                                            className={NEO_INPUT}
                                            type="text"
                                            placeholder="Note..."
                                            value={note}
                                            onChange={(e) => setNote(e.target.value)}
                                        />
                                        <textarea
                                            className={classNames(NEO_INPUT, "resize-none")}
                                            placeholder="Thought..."
                                            rows={4}
                                            value={thought}
                                            onChange={(e) => setThought(e.target.value)}
                                        />
                                        <input
                                            className={NEO_INPUT}
                                            type="datetime-local"
                                            value={dateValue}
                                            onChange={(e) => setDateValue(e.target.value)}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="h-4" />
                </div>

                {!isEditMode && (
                    <div className="pt-3 text-center">
                        <span className={classNames(
                            "inline-block px-3 py-1 rounded-sm border-[3px] border-black text-[10px] font-black uppercase tracking-widest",
                            accent, selectedCategory ? "text-white" : "bg-yellow-300 text-black"
                        )}>
                            {step === "category" && "Step 1 / pick a category"}
                            {step === "block" && "Step 2 / pick a block"}
                            {step === "type" && "Step 3 / pick a type"}
                        </span>
                    </div>
                )}
            </div>
    );
};

export const LogDialog = ({ log, defaultDate, isOpen, onClose, onAdd, onEdit, onDelete }) => (
    <Popover isOpen={isOpen}>
        <LogDialogInner
            key={log?._id || defaultDate || "new"}
            log={log}
            defaultDate={defaultDate}
            onClose={onClose}
            onAdd={onAdd}
            onEdit={onEdit}
            onDelete={onDelete}
        />
    </Popover>
);
