import { createRouter,createWebHashHistory} from "vue-router";
import demo from "../views/demo/index.vue";

const routes = [
    {
        path: "/",
        name: "demo",
        component: demo
    },
]
export default createRouter({
    history: createWebHashHistory(),
    routes: routes
})

