import { CategoryNames } from "./constants";
import classNames from "classnames";

export const CategoryButtons = ({ selectedCategory, onCategoryClick = () => { } }) => {
    return (
        <div className='flex gap-1 w-full overflow-x-auto'>
            {Object
                .values(CategoryNames)
                .map(category =>
                    <button
                        key={category.name}
                        onClick={() => onCategoryClick(category.name)}
                        className={classNames("shrink", {
                            "bg-amber-100": selectedCategory === category.name
                        })}
                    >
                        <span>{category.icon}</span>
                        {/* <span>{category.name.toUpperCase()}</span> */}
                    </button>
                )}
        </div>
    )
}