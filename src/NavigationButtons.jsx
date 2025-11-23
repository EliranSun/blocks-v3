import { Menu } from "./Menu";
import { Scopes } from "./constants";

export const NavigationButtons = ({
    onScopeChange,
    scope
}) => {
    return (
        <Menu
            items={Scopes}
            selectedItem={scope}
            label={scope}
            onItemClick={onScopeChange} />
    );
}