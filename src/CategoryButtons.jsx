import { Categories } from "./constants";
import { Menu } from "./Menu";

const CategoryItems = Object.values(Categories);

export const CategoryButtons = ({ selectedCategory, onCategoryClick = () => { } }) => {
    return (
        <Menu
            items={CategoryItems}
            onItemClick={onCategoryClick}
            showSelectedItem
            selectedItem={selectedCategory} />
    )
}