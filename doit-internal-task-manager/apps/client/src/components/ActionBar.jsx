import Text from "sparrow/src/components/Text.jsx";
import {useContext} from "react";
import {SelectedSidebarItemContext} from "../pages/AppDataProvider.jsx";

export default ActionBar;

function ActionBar() {
    const [selectedItem, setSelectedItem] = useContext(SelectedSidebarItemContext);

    return (
        <header className="action-bar subtitle-600">
            <Text>{selectedItem.label}</Text>
        </header>
    )
}