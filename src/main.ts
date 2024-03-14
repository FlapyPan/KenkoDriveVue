import { createApp } from "vue"
import { createPinia } from "pinia"
import piniaPersist from "pinia-plugin-persistedstate"
import "./vfonts/Lato.css"
import "normalize.css/normalize.css"

import App from "./App.vue"
import router from "./router"

const pinia = createPinia()
pinia.use(piniaPersist)

const app = createApp(App)
app.use(pinia)
app.use(router)

// Catch unhandled errors.
app.config.errorHandler = (err) => {
  console.error("Vue Error Handler: " + err)
}

// Catch unhandled rejections.
window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled Rejection: " + event.reason)
})

function injectUmami() {
  // 读取环境变量
  const url = import.meta.env.VITE_UMAMI_SCRIPT_URL
  const id = import.meta.env.VITE_UMAMI_WEBSITE_ID

  // 创建一个新的script元素
  const script = document.createElement("script")
  script.async = true
  script.src = url
  script.setAttribute("data-website-id", id)
  // 将script标签添加到document的head中
  document.head.appendChild(script)
}

// 仅在生产环境中注入umami统计脚本
if (import.meta.env.PROD) {
  injectUmami()
} else {
  console.debug("Development mode")
}

app.mount("#app")
