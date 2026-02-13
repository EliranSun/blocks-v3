import classNames from "classnames";

export const Popover = ({ children, isOpen }) => {
    return (
        <div className={classNames(
            "fixed inset-0 m-auto rounded-2xl",
            "shadow-xl bg-white/90 dark:bg-neutral-900/90",
            "backdrop-blur-xl border border-neutral-200/60 dark:border-neutral-700/60",
            "p-5 w-full md:h-11/12 max-w-xl z-50",
            { "hidden": !isOpen }
        )}>
            {children}
        </div>
    )
}