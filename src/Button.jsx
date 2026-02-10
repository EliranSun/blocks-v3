import classNames from "classnames";

export const Button = ({ children, className, ...rest }) => {
    return (
        <button
            {...rest}
            className={classNames("rounded flex items-center justify-center size-12 dark:bg-black bg-neutral-300 shrink-0", className)}>
            {children}
        </button>
    )
}

export const RectangleButton = ({
    children,
    type = "button",
    onClick = () => { },
    className,
    isActive,
    ...rest
}) => {
    return (
        <button
            type={type}
            onClick={onClick}
            className={classNames("p-2 rounded shadow text-sm h-10 text-left", className, {
                "bg-black": isActive,
            })}
            {...rest}>
            {children}
        </button>
    )
}