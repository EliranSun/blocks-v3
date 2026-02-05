import { useState, useEffect } from "react";
import { Button, RectangleButton } from "./Button";
import { Popover } from "./Popover";
import { Categories } from "./constants";
import classNames from "classnames";

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
        className="border-b-2 w-full h-12 px-2 text-xl"
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
            className="border-b-2 w-full h-12 px-2"
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

export const LogDialog = ({ log, isOpen, onOpen, onClose, onAdd, onEdit, onDelete }) => {
    const initData = getInitialCategory(log);
    const [selectedCategory, setSelectedCategory] = useState(initData);
    const [blockName, setBlockName] = useState(log?.name.toLowerCase());
    const isEditMode = Boolean(log?._id);

    // const [selectedCategory, setSelectedCategory] = useState(getInitialCategory);

    useEffect(() => {
        setBlockName(log ? log.name.toLowerCase() : "");
        setSelectedCategory(getInitialCategory(log));
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
        }
        onClose();
        form.reset();
    };

    const handleDelete = () => {
        if (isEditMode && onDelete) {
            onDelete(log._id);
            onClose();
        }
    };

    console.log({ selectedCategory, blockName, log });

    return (
        <div className="">
            {isOpen && <div className="fixed w-screen h-screen bg-black z-10 top-0 left-0 opacity-90" />}
            <Popover isOpen={isOpen}>
                <form key={log?._id || 'new'} className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    <fieldset className="flex flex-wrap gap-2">
                        <legend>Categories</legend>
                        {Object.entries(Categories).map(([categoryName, category]) => {
                            const isSelected = categoryName.toLowerCase() === selectedCategory.name.toLowerCase();
                            return (
                                <div
                                    key={categoryName}
                                    className={classNames(
                                        isSelected ? "bg-black outline-2" : "",
                                        category.bgColor,
                                        "p-2",
                                    )}>
                                    <input
                                        type="radio"
                                        name="category"
                                        className={classNames("hidden")}
                                        id={categoryName}
                                        value={categoryName}
                                        onChange={() => setSelectedCategory(category)}
                                        checked={isSelected} />
                                    <label for={categoryName}>{categoryName}</label>
                                </div>
                            );
                        })}
                    </fieldset>
                    <fieldset className="flex flex-wrap gap-2">
                        <legend>Blocks</legend>
                        {selectedCategory.blocks.map(block => (
                            <div
                                key={block}
                                className={classNames(
                                    selectedCategory.bgColor,
                                    blockName === block ? "bg-black outline-2" : "",
                                    "p-2"
                                )}>
                                <input
                                    type="radio"
                                    name="name"
                                    className="hidden"
                                    id={block}
                                    value={block}
                                    onChange={() => setBlockName(block)}
                                />
                                <label for={block}>{block}</label>
                            </div>
                        ))}
                    </fieldset>

                    <TextInput name="note" placeholder="note" defaultValue={log?.note || ''} />
                    <TextInput name="location" placeholder="location" defaultValue={log?.location || ''} />

                    {/* <TextInput
                        name="name"
                        placeholder="name"
                        defaultValue={log?.name || ''}
                        required
                    /> */}
                    {/* <select
                        required
                        className="border-2 py-4"
                        name="category"
                        value={selectedCategory.name}
                        onChange={e => {
                            const found = categoryArray.find(c => c.name === e.target.value);
                            setSelectedCategory(found || categoryArray[0]);
                        }}
                    >
                        {categoryArray.map(category =>
                            <option
                                key={category.name}
                                value={category.name}
                                className="bg-neutral-900"
                            >
                                {category.name}
                            </option>
                        )}
                    </select> */}
                    {/* <fieldset className={selectedCategory.subcategories ? "border-2 py-4" : "hidden"}>
                        {selectedCategory.subcategories.map(subcategory =>
                            <div
                                key={subcategory}
                                className="bg-neutral-900 text-white">
                                <input
                                    type="radio"
                                    name="subcategory"
                                    id={subcategory}
                                    value={subcategory} />
                                <label for={subcategory}>{subcategory}</label>
                            </div>)}
                    </fieldset> */}
                    <div>
                        <label htmlFor="date" className="text-xs">Start Date</label>
                        <DateInput
                            name="date"
                            defaultValue={log?.date || new Date().toISOString().slice(0, 16)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="endDate" className="text-xs">End Date</label>
                        <DateInput name="endDate" defaultValue={log?.endDate} />
                    </div>
                    <div className="flex gap-4">
                        <RectangleButton type="submit">
                            {isEditMode ? 'SAVE' : 'ADD'}
                        </RectangleButton>
                        {isEditMode && (
                            <RectangleButton type="button" onClick={handleDelete}>
                                DELETE
                            </RectangleButton>
                        )}
                        <RectangleButton type="button" onClick={onClose}>
                            CLOSE
                        </RectangleButton>
                    </div>
                </form>
            </Popover>
            <RectangleButton
                onClick={() => onOpen?.()}
                className="bg-blue-500 dark:bg-blue-700"
                aria-label="Toggle add log dialog">
                Add block
            </RectangleButton>
        </div>
    )
}
