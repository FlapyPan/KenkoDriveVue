import { ref } from "vue"
import { defineStore } from "pinia"

export const useAppConfig = defineStore(
  "app-config",
  () => {
    const isDarkMode = ref(false)
    const isMenuCollapsed = ref(false)
    const currentRouteName = ref("home")
    const isDebugMode = ref(false)
    const expandedMenuKeys = ref<string[]>([])
    const lastFolderIds = ref<Map<string, string | undefined>>(new Map())

    const isUploadDrawerShow = ref(false)
    const uploadItemCount = ref(0)

    /**
     * 切换暗黑模式
     */
    function toggleDarkMode() {
      isDarkMode.value = !isDarkMode.value
    }

    function reset() {
      isDarkMode.value = false
      isMenuCollapsed.value = false
      currentRouteName.value = ""
      isDebugMode.value = false
      expandedMenuKeys.value = []
      lastFolderIds.value = new Map()

      isUploadDrawerShow.value = false
      uploadItemCount.value = 0
    }

    return {
      isDarkMode,
      isMenuCollapsed,
      currentRouteName,
      isDebugMode,
      expandedMenuKeys,
      lastFolderIds,
      isUploadDrawerShow,
      uploadItemCount,
      toggleDarkMode,
      reset,
    }
  },
  {
    persist: {
      storage: localStorage,
      paths: ["isDarkMode", "isMenuCollapsed", "expandedMenuKeys", "currentRouteName", "isDebugMode", "lastFolderIds"],
    },
  },
)
