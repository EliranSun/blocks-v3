import classNames from "classnames";

export const Popover = ({ children, isOpen }) => {
    return (
        <div className={classNames(
            "absolute bottom-14 -left-20 rounded-xl",
            "shadow-2xl bg-white/80 dark:bg-neutral-900/80",
            "backdrop-blur-md border border-white/20 dark:border-neutral-700/30",
            "p-4 space-y-2 w-fit",
            { "hidden": !isOpen }
        )}>
            {children}
        </div>
    )
}