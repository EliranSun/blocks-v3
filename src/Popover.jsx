import classNames from "classnames";

export const Popover = ({ children, isOpen }) => {
    return (
        <div className={classNames(
            "fixed inset-0 m-auto rounded-xl",
            "shadow-2xl bg-white/80 dark:bg-neutral-900/80",
            "backdrop-blur-md border-5 border-white/90 dark:border-neutral-700/80",
            "p-4 space-y-2 w-full h-full",
            { "hidden": !isOpen }
        )}>
            {children}
        </div>
    )
}