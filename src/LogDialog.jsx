import { useState, useEffect } from "react";
import confetti from "canvas-confetti";

import { Popover } from "./Popover";
import { Categories } from "./constants";
import classNames from "classnames";
import { motion, AnimatePresence } from "framer-motion";

const PlusIcon = () => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 transition-transform duration-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" />
            <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" />
        </svg>
    )
}

const TextInput = ({ name, placeholder, required, defaultValue }) => {
    return <input
        className="w-full h-10 px-3 text-base rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 focus:outline-none focus:ring-2 focus:ring-neutral-400 transition-all placeholder:text-neutral-400"
        type="text"
        name={name}
        placeholder={placeholder}
        defaultValue={defaultValue}
        required={required} />;
};

const DateInput = ({ name, defaultValue, required }) => {
    // Adjust defaultValue to UTC+3 if provided (expecting ISO string, e.g., "2024-06-13T15:00")
    let localValue = defaultValue;
    if (defaultValue) {
        // Parse the date string and add 3 hours (UTC+3)
        const date = new Date(defaultValue);
        date.setHours(date.getHours() + 4);
        localValue = date.toISOString().slice(0, 16);
    }

    return (
        <input
            className="w-full h-10 px-3 text-base rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 focus:outline-none focus:ring-2 focus:ring-neutral-400 transition-all"
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
            delay: i * 0.06,
            type: "spring",
            damping: 20,
            stiffness: 300,
        },
    }),
};

const pillVariants = {
    idle: { scale: 1 },
    selected: {
        scale: [1, 1.15, 1],
        transition: {
            duration: 0.3,
            times: [0, 0.5, 1],
            type: "spring",
            stiffness: 400,
            damping: 15,
        },
    },
};

const fireConfetti = () => {
    const defaults = {
        spread: 360,
        ticks: 70,
        gravity: 0.8,
        decay: 0.92,
        startVelocity: 20,
        colors: ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#5f27cd'],
    };

    confetti({
        ...defaults,
        particleCount: 40,
        scalar: 1.2,
        shapes: ['star'],
        origin: { x: 0.5, y: 0.4 },
    });

    confetti({
        ...defaults,
        particleCount: 25,
        scalar: 0.8,
        shapes: ['circle'],
        origin: { x: 0.5, y: 0.4 },
    });
};

export const LogDialog = ({ log, isOpen, onOpen, onClose, onAdd, onEdit, onDelete }) => {
    const initData = getInitialCategory(log);
    const [selectedCategory, setSelectedCategory] = useState(initData);
    const [blockName, setBlockName] = useState(log?.name.toLowerCase());
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

        // Use HTML5 validation
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

        // Reset React state so controlled radio buttons are cleared
        // (form.reset() only clears uncontrolled inputs, not React state)
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
            <form key={log?._id || 'new'} className="flex flex-col gap-5 overflow-y-auto h-full" onSubmit={handleSubmit}>
                <motion.h2
                    className="text-2xl font-bold space-grotesk-600 tracking-tight"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ type: "spring", damping: 20, stiffness: 300 }}
                >
                    {isEditMode ? 'Edit Block' : 'Add Block'}
                </motion.h2>

                <motion.fieldset
                    custom={0}
                    variants={formSectionVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <legend className="text-xs uppercase tracking-widest text-neutral-400 mb-2 font-semibold">Categories</legend>
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(Categories).map(([categoryName, category]) => {
                            const isSelected = categoryName.toLowerCase() === selectedCategory.name.toLowerCase();
                            return (
                                <motion.div
                                    key={categoryName}
                                    variants={pillVariants}
                                    animate={isSelected ? "selected" : "idle"}
                                    layout
                                >
                                    <input
                                        type="radio"
                                        name="category"
                                        className="hidden peer"
                                        id={categoryName}
                                        value={categoryName}
                                        onChange={() => {
                                            setSelectedCategory(category);
                                            setSubcategory('');
                                        }}
                                        checked={isSelected} />
                                    <label
                                        htmlFor={categoryName}
                                        className={classNames(
                                            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm cursor-pointer transition-all select-none",
                                            isSelected
                                                ? "bg-neutral-800 text-white shadow-md ring-2 ring-neutral-600"
                                                : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800/50 dark:text-neutral-300 dark:hover:bg-neutral-700/60"
                                        )}>
                                        <span className="text-base">{category.icon}</span>
                                        {categoryName}
                                    </label>
                                </motion.div>
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
                    <legend className="text-xs uppercase tracking-widest text-neutral-400 mb-2 font-semibold">Blocks</legend>
                    <div className="flex flex-wrap gap-2">
                        <AnimatePresence mode="popLayout">
                            {selectedCategory.blocks.map(block => (
                                <motion.div
                                    key={block}
                                    layout
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={{ type: "spring", damping: 20, stiffness: 300 }}
                                >
                                    <motion.div
                                        variants={pillVariants}
                                        animate={blockName === block ? "selected" : "idle"}
                                    >
                                        <input
                                            type="radio"
                                            name="name"
                                            className="hidden"
                                            id={block}
                                            value={block}
                                            onChange={() => setBlockName(block)}
                                        />
                                        <label
                                            htmlFor={block}
                                            className={classNames(
                                                "px-3 py-1.5 rounded-full text-sm cursor-pointer transition-all select-none inline-block",
                                                blockName === block
                                                    ? "bg-neutral-800 text-white shadow-md ring-2 ring-neutral-600"
                                                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800/50 dark:text-neutral-300 dark:hover:bg-neutral-700/60"
                                            )}>
                                            {block}
                                        </label>
                                    </motion.div>
                                </motion.div>
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
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        >
                            <legend className="text-xs uppercase tracking-widest text-neutral-400 mb-2 font-semibold">Type</legend>
                            <div className="flex flex-wrap gap-2">
                                {selectedCategory.subcategories.map(sub => (
                                    <motion.div
                                        key={sub}
                                        variants={pillVariants}
                                        animate={subcategory === sub ? "selected" : "idle"}
                                        layout
                                    >
                                        <input
                                            type="radio"
                                            name="subcategory"
                                            className="hidden"
                                            id={sub}
                                            value={sub}
                                            onChange={() => setSubcategory(sub)}
                                            checked={subcategory === sub}
                                        />
                                        <label
                                            htmlFor={sub}
                                            className={classNames(
                                                "px-3 py-1.5 rounded-full text-sm cursor-pointer transition-all select-none inline-block",
                                                subcategory === sub
                                                    ? "bg-neutral-800 text-white shadow-md ring-2 ring-neutral-600"
                                                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800/50 dark:text-neutral-300 dark:hover:bg-neutral-700/60"
                                            )}>
                                            {sub}
                                        </label>
                                    </motion.div>
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
                    <label className="text-xs uppercase tracking-widest text-neutral-400 mb-1 font-semibold block">Note</label>
                    <TextInput name="note" placeholder="Add a note..." defaultValue={log?.note || ''} />
                </motion.div>

                <motion.div
                    custom={3}
                    variants={formSectionVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <label htmlFor="date" className="text-xs uppercase tracking-widest text-neutral-400 mb-1 font-semibold block">Date</label>
                    <DateInput
                        name="date"
                        defaultValue={log?.date || new Date().toISOString().slice(0, 16)}
                        required
                    />
                </motion.div>

                <motion.div
                    className="flex gap-3 w-full pt-2"
                    custom={4}
                    variants={formSectionVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        whileHover={{ scale: 1.02 }}
                        type="submit"
                        className="grow h-11 rounded-lg bg-neutral-800 text-white font-semibold text-sm hover:bg-neutral-700 transition-colors">
                        {isEditMode ? 'SAVE' : 'ADD'}
                    </motion.button>
                    {isEditMode && (
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            whileHover={{ scale: 1.02 }}
                            type="button"
                            className="grow h-11 rounded-lg bg-red-500/15 text-red-500 font-semibold text-sm hover:bg-red-500/25 transition-colors"
                            onClick={handleDelete}>
                            DELETE
                        </motion.button>
                    )}
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        whileHover={{ scale: 1.02 }}
                        type="button"
                        className="grow h-11 rounded-lg bg-neutral-100 text-neutral-600 font-semibold text-sm hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 transition-colors"
                        onClick={onClose}>
                        CLOSE
                    </motion.button>
                </motion.div>
            </form>
        </Popover>
    )
}
