<script setup lang="ts">
import { useAppConfig } from '@/stores/app-config'
import { useUserInfo } from '@/stores/user-info'
import { storeToRefs } from 'pinia'
import getAssetsUrl from '@/utils/pub-use'
import { CashOutline, LogOutOutline } from '@vicons/ionicons5'
import QrcodeVue from 'qrcode.vue'
const { isDarkMode } = storeToRefs(useAppConfig())
const { userName } = storeToRefs(useUserInfo())
</script>

<template>
  <n-layout-header
    style="height: 64px; display: flex; align-items: center; justify-content: space-between"
    bordered
  >
    <n-space style="margin-left: 36px; display: flex; align-items: center; height: 36px">
      <n-popover trigger="hover" :show-arrow="false" title='网站二维码'>
        <template #header>
          <n-text strong depth="1">
            网站二维码
          </n-text>
        </template>
        <template #trigger>
          <router-link to="/">
            <n-space style="height: 36px">
              <n-image
                src="/favicon.svg"
                width="36"
                preview-disabled
                :img-props="{
              alt: 'logo',
            }"
              />
              <n-h2> Kenko Drive</n-h2>
            </n-space>
          </router-link>
        </template>
        <qrcode-vue value="https://drive.akagiyui.com" :size="200" render-as="canvas" level="H" />
      </n-popover>


    </n-space>
    <n-space style="margin-right: 24px; display: flex; align-items: center; height: 64px">
      <n-switch v-model:value="isDarkMode">
        <template #checked-icon> 🌙</template>
        <template #unchecked-icon> ☀️</template>
        <template #checked> 测试阶段</template>
        <template #unchecked> 全局暗色</template>
      </n-switch>
      <n-popover trigger="hover" :show-arrow="false">
        <template #trigger>
          <n-space style="display: flex; align-items: center">
            <n-h4>{{ userName }}</n-h4>
            <n-badge dot :show="true">
              <n-avatar
                bordered
                :size="46"
                src="https://gravatar.loli.net/avatar/f481f2a9c66b7414da397c36868a2285"
                :fallback-src="getAssetsUrl('default-avatar.jpg')"
                :img-props="{
                  alt: 'avatar',
                }"
              />
            </n-badge>
          </n-space>
        </template>
        <n-space vertical justify="space-evenly">
          <n-button text class="pop-button">
            <template #icon>
              <n-icon>
                <CashOutline />
              </n-icon>
            </template>
            查看个人信息
          </n-button>
          <n-button text class="pop-button" type="warning">
            <template #icon>
              <n-icon>
                <LogOutOutline />
              </n-icon>
            </template>退出登录</n-button>
        </n-space>
      </n-popover>
    </n-space>
  </n-layout-header>
</template>

<style scoped>
a {
  text-decoration: none;
}

.pop-button {
  width: 140px;
}
</style>