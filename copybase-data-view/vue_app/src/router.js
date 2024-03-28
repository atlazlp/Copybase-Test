import { createMemoryHistory, createRouter } from 'vue-router'

import UploadFile from './components/UploadFile.vue'

const routes = [
  { path: '/', component: UploadFile },
]

const router = createRouter({
  history: createMemoryHistory(),
  routes,
})

export default router