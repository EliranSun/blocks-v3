import { CategoryNames } from "./constants";
import { Menu } from "./Menu";

const Categories = Object.values(CategoryNames);

export const CategoryButtons = ({ selectedCategory, onCategoryClick = () => { } }) => {
    return (
        <Menu
            items={Categories}
            onItemClick={onCategoryClick}
            selectedItem={selectedCategory} />
    )
}