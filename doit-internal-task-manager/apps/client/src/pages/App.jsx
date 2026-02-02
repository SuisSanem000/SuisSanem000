import '../styles/app.scss'
import SidePanel from "../components/SidePanel.jsx";
import ActionBar from "../components/ActionBar.jsx";
import MainPanel from "../components/MainPanel.jsx";

export default function App() {
    return (
        <div className="app">
            <SidePanel/>
            <ActionBar/>
            <MainPanel/>
        </div>
    )
}
