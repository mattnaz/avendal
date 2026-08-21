import DefaultTheme from "vitepress/theme";
import MapView from "./components/MapView.vue";

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component("MapView", MapView);
  },
};
