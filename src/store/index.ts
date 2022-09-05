import { createStore } from 'vuex';
import components from './modules/components';
import graph from './modules/graph';
import context from './modules/context';
import transform from './modules/transform';

export const store = createStore({
  modules: {
    graph,
    context,
    transform,
    components,
  }
})
