import { useState } from 'react';
import { Button } from './Button';

export const Search = ({
    value,
    onOpen = () => { },
    onClose = () => { },
    autoHide = true,
    onInputChange = () => { }
}) => {
    const [isOpen, setIsOpen] = useState(!autoHide);

    const handleToggle = () => {
        if (!autoHide) return;

        setIsOpen(!isOpen);

        isOpen ? onClose() : onOpen();

        if (isOpen) {
            onInputChange('');
        }
    };

    return (
        <div className="flex flex-row-reverse items-center gap-2 border rounded">
            <Button
                onClick={handleToggle}
                aria-label="Toggle search"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 transition-transform duration-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                </svg>
            </Button>
            <div className={`
                relative flex items-center
                text-lg
                transition-all duration-300 ease-in-out
                overflow-hidden
                ${isOpen ? 'w-full px-4 py-2 opacity-100' : 'w-0 px-0 py-2 opacity-0'}
            `}>
                <input
                    type="text"
                    className="w-full outline-none bg-transparent"
                    value={value}
                    placeholder="Search..."
                    onChange={event => onInputChange(event.target.value)}
                    autoFocus={isOpen}
                />
                {value && (
                    <button
                        onClick={() => onInputChange('')}
                        aria-label="Clear search"
                        className="
                            flex items-center justify-center
                            ml-2 p-1 rounded-full
                            hover:scale-110 active:scale-95
                            transition-transform duration-200
                        "
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    )
}