import "vue-multiselect/dist/vue-multiselect.min.css";
import "./assets/main.css";
import { createApp } from "vue";
import App from "./App.vue";
import i18next from "i18next";
import I18NextVue from "i18next-vue";
import i18n_en from './i18n/en';
import i18n_ru from './i18n/ru';

const locales = {
  en: i18n_en,
  ru: i18n_ru,
};

i18next.init({
  lng: localStorage.getItem("language") ?? "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
  pluralSeparator: '__',
  resources: {
    en: { translation: locales.en },
    ru: { translation: locales.ru },
  },
});


createApp(App).use(I18NextVue, { i18next }).mount("#app");
