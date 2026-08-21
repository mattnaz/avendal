import DefaultTheme from "vitepress/theme";
import "./custom.css";
import MapView from "./components/MapView.vue";
import Roster from "./components/Roster.vue";

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component("MapView", MapView);
    app.component("Roster", Roster);
  },
};
