import { useState } from "react";
import { Button } from "./Button";
import { Popover } from "./Popover";

const INPUT_CLASS = "border w-full h-12 px-2";

export const AddLogDialog = ({ onSubmit }) => {
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    return (
        <div className="relative">
            <Popover isOpen={isPopoverOpen}>
                <form className="flex flex-col gap-4" action={onSubmit}>
                    <label>Case insensitive, don't worry</label>
                    <input className={INPUT_CLASS} type="text" name="name" placeholder="name" />
                    <input className={INPUT_CLASS} type="text" name="category" placeholder="category" />
                    <input
                        className={INPUT_CLASS}
                        type="datetime-local"
                        name="date"
                        defaultValue={new Date().toISOString().slice(0, 16)}
                    />
                    <hr />
                    <label htmlFor="endDate" className="text-xs">End Date</label>
                    <input
                        className={INPUT_CLASS}
                        type="datetime-local"
                        name="endDate"
                    />
                    <input className={INPUT_CLASS} type="text" name="subcategory" placeholder="subcategory" />
                    <input className={INPUT_CLASS} type="text" name="location" placeholder="location" />
                    <input className={INPUT_CLASS} type="text" name="note" placeholder="note" />
                    <div className="flex justify-between">
                        <button type="submit"
                            className="border-b-2">
                            ADD
                        </button>
                        <button
                            type="button"
                            className="border-b-2"
                            onClick={() => setIsPopoverOpen(false)}
                        >
                            CLOSE
                        </button>
                    </div>
                </form>
            </Popover>
            <Button onClick={() => setIsPopoverOpen(!isPopoverOpen)} aria-label="Toggle add log dialog">
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
            </Button>
        </div>
    )
}