import { useState, useEffect } from "react";
import confetti from "canvas-confetti";

import { Popover } from "./Popover";
import { Categories } from "./constants";
import classNames from "classnames";
import { motion, AnimatePresence } from "framer-motion";

const SNAP = { type: "spring", stiffness: 800, damping: 22, mass: 0.5 };

const inputClasses = "w-full px-3 text-base brut-border bg-(--color-brut-paper) text-(--brut-fg) outline-none focus:translate-x-[-2px] focus:translate-y-[-2px] focus:shadow-[var(--brut-shadow-sm)] transition-transform duration-100 placeholder:opacity-50 font-bold";

const TextInput = ({ name, placeholder, required, defaultValue }) => {
    return <input
        className={classNames(inputClasses, "h-10")}
        type="text"
        name={name}
        placeholder={placeholder}
        defaultValue={defaultValue}
        required={required} />;
};

const TextArea = ({ name, placeholder, defaultValue }) => {
    return <textarea
        className={classNames(inputClasses, "py-2 resize-none")}
        name={name}
        placeholder={placeholder}
        defaultValue={defaultValue}
        rows={6}
    />;
};

const DateInput = ({ name, defaultValue, required }) => {
    let localValue = defaultValue;
    if (defaultValue) {
        const date = new Date(defaultValue);
        date.setHours(date.getHours() + 4);
        localValue = date.toISOString().slice(0, 16);
    }

    return (
        <input
            className={classNames(inputClasses, "h-10 min-w-0")}
            type="datetime-local"
            name={name}
            defaultValue={localValue}
            required={required}
        />
    );
};

const categoryArray = Object.values(Categories);

const getInitialCategory = (log) => {
    if (log?.category) {
        const found = categoryArray.find(c => c.name.toLowerCase() === log.category.toLowerCase());
        return found || categoryArray[0];
    }
    return categoryArray[0];
};

const formSectionVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: i * 0.04,
            type: "spring",
            stiffness: 800,
            damping: 22,
            mass: 0.5,
        },
    }),
};

const fireConfetti = () => {
    const defaults = {
        spread: 360,
        ticks: 70,
        gravity: 0.8,
        decay: 0.92,
        startVelocity: 25,
        colors: ['#ff6a00', '#ffd400', '#2b7fff', '#ff4dd2', '#b6f24c', '#ff2e2e', '#0a0a0a'],
    };

    confetti({
        ...defaults,
        particleCount: 50,
        scalar: 1.4,
        shapes: ['square'],
        origin: { x: 0.5, y: 0.4 },
    });

    confetti({
        ...defaults,
        particleCount: 25,
        scalar: 1,
        shapes: ['circle'],
        origin: { x: 0.5, y: 0.4 },
    });
};

const Pill = ({ id, name, value, isSelected, onSelect, children }) => (
    <motion.div whileHover={{ x: -2, y: -2 }} whileTap={{ x: 2, y: 2 }} transition={SNAP} layout>
        <input
            type="radio"
            name={name}
            className="hidden"
            id={id}
            value={value}
            onChange={onSelect}
            checked={isSelected}
        />
        <label
            htmlFor={id}
            className={classNames(
                "inline-flex items-center gap-1.5 px-3 py-1.5 text-sm cursor-pointer select-none brut-border uppercase tracking-wide font-bold",
                isSelected
                    ? "bg-(--brut-fg) text-(--brut-bg) brut-shadow-sm"
                    : "bg-(--color-brut-paper) text-(--brut-fg) hover:bg-(--color-brut-yellow)"
            )}>
            {children}
        </label>
    </motion.div>
);

export const LogDialog = ({ log, defaultDate, isOpen, onOpen, onClose, onAdd, onEdit, onDelete }) => {
    const initData = getInitialCategory(log);
    const [selectedCategory, setSelectedCategory] = useState(initData);
    const [blockName, setBlockName] = useState(log?.name?.toLowerCase() || "");
    const [subcategory, setSubcategory] = useState(log?.subcategory || '');
    const isEditMode = Boolean(log?._id);

    useEffect(() => {
        setBlockName(log ? log.name.toLowerCase() : "");
        setSelectedCategory(getInitialCategory(log));
        setSubcategory(log?.subcategory || '');
    }, [log]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const form = e.target;

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const formData = new FormData(form);
        const data = {};
        for (let [key, value] of formData.entries()) {
            if (value) data[key] = value;
        }

        if (isEditMode) {
            onEdit(log._id, data);
        } else {
            onAdd(data);
            fireConfetti();
        }

        setSelectedCategory(categoryArray[0]);
        setBlockName("");
        setSubcategory('');

        form.reset();
        onClose();
    };

    const handleDelete = () => {
        if (isEditMode && onDelete) {
            onDelete(log._id);
            onClose();
        }
    };

    return (
        <Popover isOpen={isOpen}>
            <form key={log?._id || defaultDate || 'new'} className="flex flex-col h-full" onSubmit={handleSubmit}>
                <div className="flex flex-col gap-5 overflow-y-auto overflow-x-hidden flex-1 pb-2">
                <motion.h2
                    className="text-3xl font-display font-black uppercase tracking-tight"
                    style={{ fontFamily: 'var(--font-display)' }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={SNAP}
                >
                    {isEditMode ? 'Edit Block' : 'Add Block'}
                </motion.h2>

                <motion.fieldset
                    custom={0}
                    variants={formSectionVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <legend className="brut-label mb-2">Categories</legend>
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(Categories).map(([categoryName, category]) => {
                            const isSelected = categoryName.toLowerCase() === selectedCategory.name.toLowerCase();
                            return (
                                <Pill
                                    key={categoryName}
                                    id={categoryName}
                                    name="category"
                                    value={categoryName}
                                    isSelected={isSelected}
                                    onSelect={() => {
                                        setSelectedCategory(category);
                                        setSubcategory('');
                                    }}
                                >
                                    <span className="text-base">{category.icon}</span>
                                    {categoryName}
                                </Pill>
                            );
                        })}
                    </div>
                </motion.fieldset>

                <motion.fieldset
                    custom={1}
                    variants={formSectionVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <legend className="brut-label mb-2">Blocks</legend>
                    <div className="flex flex-wrap gap-2">
                        <AnimatePresence mode="popLayout">
                            {selectedCategory.blocks.map(block => (
                                <Pill
                                    key={block}
                                    id={block}
                                    name="name"
                                    value={block}
                                    isSelected={blockName === block}
                                    onSelect={() => setBlockName(block)}
                                >
                                    {block}
                                </Pill>
                            ))}
                        </AnimatePresence>
                    </div>
                </motion.fieldset>

                <AnimatePresence>
                    {selectedCategory.subcategories?.length > 0 && (
                        <motion.fieldset
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={SNAP}
                        >
                            <legend className="brut-label mb-2">Type</legend>
                            <div className="flex flex-wrap gap-2">
                                {selectedCategory.subcategories.map(sub => (
                                    <Pill
                                        key={sub}
                                        id={sub}
                                        name="subcategory"
                                        value={sub}
                                        isSelected={subcategory === sub}
                                        onSelect={() => setSubcategory(sub)}
                                    >
                                        {sub}
                                    </Pill>
                                ))}
                            </div>
                        </motion.fieldset>
                    )}
                </AnimatePresence>

                <motion.div
                    custom={2}
                    variants={formSectionVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <label className="brut-label mb-1 block">Note</label>
                    <TextInput name="note" placeholder="Add a note..." defaultValue={log?.note || ''} />
                </motion.div>

                <motion.div
                    custom={3}
                    variants={formSectionVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <label className="brut-label mb-1 block">Thought</label>
                    <TextArea name="thought" placeholder="Add a thought..." defaultValue={log?.thought || ''} />
                </motion.div>

                <motion.div
                    custom={4}
                    variants={formSectionVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <label htmlFor="date" className="brut-label mb-1 block">Date</label>
                    <DateInput
                        name="date"
                        defaultValue={log?.date || defaultDate || new Date().toISOString().slice(0, 16)}
                        required
                    />
                </motion.div>
                </div>

                <motion.div
                    className="flex gap-2 w-full pt-3"
                    custom={5}
                    variants={formSectionVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.button
                        whileHover={{ x: -2, y: -2 }}
                        whileTap={{ x: 2, y: 2 }}
                        transition={SNAP}
                        type="submit"
                        className="grow h-11 brut-border brut-shadow-sm bg-(--color-brut-orange) text-(--color-brut-ink) uppercase font-black tracking-wider text-sm">
                        {isEditMode ? 'Save' : 'Add'}
                    </motion.button>
                    {isEditMode && (
                        <motion.button
                            whileHover={{ x: -2, y: -2 }}
                            whileTap={{ x: 2, y: 2 }}
                            transition={SNAP}
                            type="button"
                            className="grow h-11 brut-border brut-shadow-sm bg-(--color-brut-red) text-white uppercase font-black tracking-wider text-sm"
                            onClick={handleDelete}>
                            Delete
                        </motion.button>
                    )}
                    <motion.button
                        whileHover={{ x: -2, y: -2 }}
                        whileTap={{ x: 2, y: 2 }}
                        transition={SNAP}
                        type="button"
                        className="grow h-11 brut-border brut-shadow-sm bg-(--color-brut-paper) text-(--brut-fg) uppercase font-black tracking-wider text-sm"
                        onClick={onClose}>
                        Close
                    </motion.button>
                </motion.div>
            </form>
        </Popover>
    )
}
