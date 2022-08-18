import { createApp } from "vue"
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css';
import App from './App.vue'
import router from './route/index'
import { store } from './store/index';
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}
app
  .use(store)
  .use(router)
  .use(ElementPlus)
  .mount('#app')
