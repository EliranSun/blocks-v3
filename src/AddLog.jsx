import { useState } from "react";
import { Button, RectangleButton } from "./Button";
import { Popover } from "./Popover";

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

const TextInput = ({ name, placeholder, required }) => {
    return <input
        className="border-b-2 w-full h-12 px-2 text-xl"
        type="text"
        name={name}
        placeholder={placeholder}
        required={required} />
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

export const AddLogDialog = ({ onSubmit }) => {
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        const form = e.target;

        // Use HTML5 validation
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const formData = new FormData(form);
        onSubmit(formData);
        setIsPopoverOpen(false);
        form.reset();
    };

    return (
        <div>
            <Popover isOpen={isPopoverOpen}>
                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    <TextInput name="name" placeholder="name" required />
                    <TextInput name="category" placeholder="category" required />
                    <div>
                        <label htmlFor="date" className="text-xs">Start Date</label>
                        <DateInput
                            name="date"
                            defaultValue={new Date().toISOString().slice(0, 16)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="endDate" className="text-xs">End Date</label>
                        <DateInput name="endDate" />
                    </div>
                    <TextInput name="subcategory" placeholder="subcategory" />
                    <TextInput name="location" placeholder="location" />
                    <TextInput name="note" placeholder="note" />
                    <div className="flex gap-4">
                        <RectangleButton type="submit">
                            ADD
                        </RectangleButton>
                        <RectangleButton type="button" onClick={() => setIsPopoverOpen(false)}>
                            CLOSE
                        </RectangleButton>
                    </div>
                </form>
            </Popover>
            <Button
                onClick={() => setIsPopoverOpen(!isPopoverOpen)}
                aria-label="Toggle add log dialog">
                <PlusIcon />
            </Button>
        </div>
    )
}