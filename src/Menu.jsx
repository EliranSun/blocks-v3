import classNames from "classnames";
import { useState } from "react";
import { Button } from "./Button";

export const Menu = ({ items = [], selectedItem, onItemClick = () => { }, label = "" }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className='relative'>
            <Button
                onClick={() => setIsOpen(!isOpen)}
                className={classNames(
                    "rounded-full flex items-center justify-center", {
                    "size-12": !label,
                    "h-12 w-24": label
                })}>
                {label || "≡"}
            </Button>
            {isOpen &&
                <ul className={classNames(
                    "absolute bottom-12 rounded-xl",
                    "shadow-2xl bg-neutral-100 dark:bg-neutral-900",
                    "p-4 space-y-2 w-40"
                )}>
                    {items.map(({ name, icon }) =>
                        <li
                            key={name}
                            onClick={() => {
                                onItemClick(name);
                                setIsOpen(false);
                            }}
                            className={classNames("", {
                                "bg-amber-100 dark:bg-amber-900": selectedItem === name
                            })}
                        >
                            {icon} {name.toUpperCase()}
                        </li>
                    )}
                </ul>}
        </div>
    )
}