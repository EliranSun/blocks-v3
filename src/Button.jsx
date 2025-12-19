import classNames from "classnames";

export const Button = ({ children, className, ...rest }) => {
    return (
        <button
            {...rest}
            className={classNames("rounded-full flex items-center justify-center", className, {
                "size-12 bg-neutral-600 shrink-0": true,
            })}>
            {children}
        </button>
    )
}

export const RectangleButton = ({ children, type = "button", onClick = () => { }, ...rest }) => {
    return (
        <button
            type={type}
            onClick={onClick}
            className="p-4 rounded bg-black shadow text-sm h-12"
            {...rest}>
            {children}
        </button>
    )
}