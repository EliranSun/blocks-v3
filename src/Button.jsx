import classNames from "classnames";

export const Button = ({ children, className, ...rest }) => {
    return (
        <button
            {...rest}
            className={classNames("rounded-full flex items-center justify-center", className, {
                "size-12 shadow-lg border border-gray-300": true,
            })}>
            {children}
        </button>
    )
}