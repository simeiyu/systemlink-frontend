import { createRouter,createWebHashHistory} from "vue-router";
import demo from "../views/demo/index.vue";
import demo2 from "../views/demo/demo2.vue"

const routes = [
    {
        path: "/",
        name: "demo",
        component: demo
    },
    {
        path: "/demo2",
        name: "demo2",
        component: demo2
    },
]
export default createRouter({
    history: createWebHashHistory(),
    routes: routes
})

