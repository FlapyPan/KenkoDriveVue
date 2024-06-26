<route lang="json">
{
  "name": "user-manage",
  "meta": {
    "title": "用户管理"
  }
}
</route>

<script setup lang="ts">
import { changeColor } from "seemly"
import { AddOutline, RefreshOutline, SearchOutline } from "@vicons/ionicons5"
import { NButton, NInput, NProgress, NSpace, NText, NTooltip, useThemeVars } from "naive-ui"
import type { FormInst, PaginationProps } from "naive-ui"
import { addUser, deleteUser, getUsers, updateUserDisabled, updateUserInfo, updateUserPassword } from "@/api"
import RoleTable from "./RoleTable.vue"
import ConfirmModal from "@/components/ConfirmModal.vue"
import { renderTooltip } from "@/utils"

/** naiveui主题相关变量 */
const themeVars = useThemeVars()
/** 表格加载中 */
const isLoading = ref(false)
/** 分页器 */
const pagination = reactive({
  /** 当前页，从 1 开始 */
  page: 1,
  /** 每页记录数 */
  pageSize: 15,
  /** 是否显示分页器 */
  showSizePicker: true,
  /** 每页记录数选项 */
  pageSizes: [5, 10, 15, 20, 50, 100].map((i) => ({
    label: `每页 ${i} 项`,
    value: i,
  })),
  /** 总记录数 */
  itemCount: 0,
  /** 总记录数显示文本 */
  prefix: (p: PaginationProps) => `共 ${p.itemCount} 项`,
})
/** 显示删除确认模态框 */
const showDeleteConfirmModal = ref(false)
const modalFormRef = ref<FormInst | null>(null)
/** 模态框信息 */
const modalData = ref({
  username: "",
  password: "",
  repeatPassword: "",
  nickname: "",
  email: "",
})
/** 模态框表单校验规则 */
const rules = {
  username: {
    required: true,
    message: "请输入用户名",
    trigger: ["input", "blur"],
  },
  password: {
    required: true,
    message: "请输入密码",
    trigger: ["input", "blur"],
  },
  repeatPassword: [
    {
      required: true,
      message: "请再次输入密码",
      trigger: ["input", "blur"],
    },
    {
      validator: (_: any, value: string) => {
        if (value !== modalData.value.password) {
          return new Error("两次输入的密码不一致")
        }
        return true
      },
      trigger: ["input", "blur"],
    },
  ],
  nickname: {
    required: false,
    message: "请输入昵称",
    min: 1,
    trigger: ["input", "blur"],
  },
  email: {
    required: false,
    message: "请输入邮箱",
    min: 1,
    trigger: ["input", "blur"],
  },
}
// 是否显示重置密码模态框
const showResetPasswordModal = ref(false)
// 重置密码模态框数据
const resetPasswordData = ref({ password: "", confirmPassword: "" })
// 重置密码模态框表单校验规则
const resetPasswordRules = {
  password: {
    required: true,
    message: "请输入新密码",
    min: 1,
    trigger: ["input", "blur"],
  },
  confirmPassword: [
    {
      required: true,
      message: "请再次输入新密码",
      min: 1,
      trigger: ["input", "blur"],
    },
    {
      validator: (_: any, value: string) => {
        if (value !== resetPasswordData.value.password) {
          return new Error("两次输入的密码不一致")
        }
        return true
      },
      trigger: ["input", "blur"],
    },
  ],
}
/** 搜索表达式 */
const searchExpression = ref("")
/** 重置密码模态框表单引用 */
const resetPasswordFormRef = ref<FormInst | null>(null)
/** 表格列 */
const tableColumns = [
  {
    title: "用户名",
    key: "username",
  },
  {
    title: "昵称",
    key: "nickname",
  },
  {
    title: "邮箱",
    key: "email",
  },
  // {
  //   title: "配额",
  //   key: "capacity",
  //   minWidth: "100px",
  //   render: () => {
  //     return h(
  //       NTooltip,
  //       {
  //         placement: "bottom",
  //       },
  //       {
  //         trigger: () =>
  //           h(
  //             NProgress,
  //             {
  //               type: "line",
  //               "indicator-placement": "outside",
  //               color: themeVars.value.successColor,
  //               "rail-color": changeColor(themeVars.value.successColor, {
  //                 alpha: 0.2,
  //               }),
  //               percentage: 20,
  //             },
  //             {
  //               default: () => "20%",
  //             },
  //           ),
  //         default: () => "20G / 100G",
  //       },
  //     )
  //   },
  // },
  {
    title: () => {
      return renderTooltip(
        h(
          NText,
          {
            size: 24,
            strong: true,
          },
          { default: () => "状态" },
        ),
        "禁用后，用户将无法登录系统",
      )
    },
    key: "isDisabled",
    width: "0",
    render: (row: UserInfoResponse) => {
      return h(
        NButton,
        {
          strong: true,
          tertiary: true,
          size: "small",
          type: !row.disabled ? "success" : "error",
          onClick: async () => {
            row.disabled = !row.disabled
            await updateUserDisabled(row.id, row.disabled)
            window.$message.success("操作成功")
          },
        },
        { default: () => (!row.disabled ? "已启用" : "已禁用") },
      )
    },
  },
  {
    title: "操作",
    key: "actions",
    width: "250px",
    render: (row: UserInfoResponse) => {
      return h(
        NSpace,
        {},
        {
          default: () => [
            h(
              NButton,
              {
                size: "small",
                type: "info",
                secondary: true,
                onClick: () => onAssignRoleButtonClick(row),
              },
              { default: () => "分配角色" },
            ),
            h(
              NButton,
              {
                size: "small",
                type: "warning",
                secondary: true,
                onClick: () => onEditButtonClick(row),
              },
              { default: () => "修改信息" },
            ),

            // h(
            //   NButton,
            //   {
            //     size: "small",
            //     type: "warning",
            //     secondary: true,
            //     onClick: () => {
            //       selectRow.value = row
            //       if (!selectRow.value) return
            //       showResetPasswordModal.value = true
            //     },
            //   },
            //   { default: () => "重置密码" },
            // ),
            h(
              NButton,
              {
                size: "small",
                type: "error",
                secondary: true,
                onClick: () => {
                  selectRow.value = row
                  if (!selectRow.value) return
                  showDeleteConfirmModal.value = true
                },
              },
              { default: () => "删除" },
            ),
          ],
        },
      )
    },
  },
]
/** 表格数据 */
const tableData = ref<UserInfoResponse[]>([])
/** 选中行 */
const selectRow = ref<UserInfoResponse | null>(null)
/** 显示编辑模态框 */
const showEditModal = ref(false)
/** 处于编辑/新增 */
const isEdit = ref(false)
/** 显示角色表格 */
const showRoleTable = ref(false)

/** 页码改变事件 */
const onPageChange = (page: number) => {
  pagination.page = page
  getData()
}
/** 每页记录数改变事件 */
const onPageSizeChange = (pageSize: number) => {
  pagination.pageSize = pageSize
  pagination.page = 1
  getData()
}
/** 页面挂载前开始获取数据 */
onBeforeMount(() => {
  getData()
})
/** 删除用户确认事件 */
const onDeleteUserConfirm = async () => {
  if (!selectRow.value) return
  await deleteUser(selectRow.value.id)
  getData()
  window.$message.success("删除成功")
  showDeleteConfirmModal.value = false
}
/** 重置密码按钮点击事件 */
const onResetPasswordClick = async () => {
  await resetPasswordFormRef.value?.validate()
  const selectedId = selectRow.value?.id
  if (!selectedId) return
  await updateUserPassword(selectedId, resetPasswordData.value.password)
  window.$message.success("密码重置成功")
  showResetPasswordModal.value = false
}
/** 重置密码模态框关闭后事件 */
const onAfterResetPasswordModalLeave = () => {
  resetPasswordData.value = { password: "", confirmPassword: "" }
}
/** 编辑模态框关闭后事件 */
const onAfterEditModalLeave = () => {
  modalData.value = {
    username: "",
    password: "",
    repeatPassword: "",
    nickname: "",
    email: "",
  }
}
/** 新增按钮点击事件 */
const onAddButtonClick = () => {
  isEdit.value = false
  showEditModal.value = true
}
/** 模态框按钮点击事件 */
const onModalPositiveButtonClick = async () => {
  try {
    // 尝试验证模态表单
    await modalFormRef.value?.validate()

    if (isEdit.value) {
      // 修改用户信息
      if (!selectRow.value) {
        throw new Error("未选中用户")
      }
      if (!selectRow.value.id) {
        throw new Error("未获取到用户ID")
      }
      await updateUserInfo(selectRow.value.id, modalData.value)
      window.$message.success("修改成功")
    } else {
      // 新增用户
      await addUser(modalData.value)
      window.$message.success("新增成功")
    }

    getData()
    showEditModal.value = false
  } catch (error) {
    window.$message.error("操作失败")
    console.error(error)
  }
}
/** 编辑按钮点击事件 */
const onEditButtonClick = (row: UserInfoResponse) => {
  isEdit.value = true
  selectRow.value = row
  modalData.value = {
    username: row.username,
    password: "",
    repeatPassword: "",
    nickname: row.nickname,
    email: row.email,
  }
  showEditModal.value = true
}
watch(isEdit, (isEdit) => {
  // 修改规则
  if (isEdit) {
    rules.password.required = false
    rules.repeatPassword[0].required = false
  } else {
    rules.password.required = true
    rules.repeatPassword[0].required = true
  }
})
/** 分配角色按钮点击事件 */
const onAssignRoleButtonClick = (row: UserInfoResponse) => {
  selectRow.value = row
  showRoleTable.value = true
}

/** 获取表格数据 */
const getData = async () => {
  isLoading.value = true
  const data = await getUsers(pagination.page - 1, pagination.pageSize, searchExpression.value)
  tableData.value = data.list
  pagination.itemCount = data.itemCount
  isLoading.value = false
}
</script>

<template>
  <div style="padding: 12px">
    <!-- 确认删除模态框 -->
    <ConfirmModal v-model:show="showDeleteConfirmModal" @positive-click="onDeleteUserConfirm" />

    <!-- 重置密码模态框 -->
    <n-modal
      v-model:show="showResetPasswordModal"
      preset="card"
      :closable="true"
      bordered
      :title="`重置密码 (${selectRow?.username})`"
      :mask-closable="false"
      :style="{
        width: '400px',
      }"
      @after-leave="onAfterResetPasswordModalLeave"
    >
      <n-space vertical>
        <n-form
          ref="resetPasswordFormRef"
          :model="resetPasswordData"
          :rules="resetPasswordRules"
          label-placement="left"
          label-width="auto"
        >
          <n-form-item path="password" label="新密码">
            <n-input v-model:value="resetPasswordData.password" clearable placeholder="输入新密码" type="password" />
          </n-form-item>
          <n-form-item path="confirmPassword" label="确认密码">
            <n-input
              v-model:value="resetPasswordData.confirmPassword"
              clearable
              placeholder="再次输入新密码"
              type="password"
            />
          </n-form-item>
        </n-form>
        <n-space justify="end">
          <n-button type="error" @click="() => (showResetPasswordModal = false)"> 取消 </n-button>
          <n-button type="primary" @click="onResetPasswordClick"> 确定 </n-button>
        </n-space>
      </n-space>
    </n-modal>

    <!-- 新增编辑模态框 -->
    <n-modal
      v-model:show="showEditModal"
      preset="card"
      :style="{
        width: '400px',
      }"
      :title="isEdit ? '修改信息' : '新增用户'"
      :bordered="false"
      :mask-closable="false"
      @after-leave="onAfterEditModalLeave"
    >
      <n-space vertical>
        <n-form ref="modalFormRef" :model="modalData" :rules="rules" label-placement="left" label-width="auto">
          <n-form-item path="username" label="用户名">
            <n-tooltip :disabled="!isEdit" trigger="hover" placement="top">
              <template #trigger>
                <n-input
                  v-model:value="modalData.username"
                  clearable
                  placeholder="输入用户名"
                  :input-props="{ autocomplete: 'off' }"
                  :disabled="isEdit"
                />
              </template>
              用户名不可修改
            </n-tooltip>
          </n-form-item>
          <n-form-item path="password" label="密码">
            <n-input
              v-model:value="modalData.password"
              type="password"
              clearable
              placeholder="输入密码"
              :input-props="{ autocomplete: 'new-password' }"
            />
          </n-form-item>
          <n-form-item path="repeatPassword" label="确认密码">
            <n-input v-model:value="modalData.repeatPassword" type="password" clearable placeholder="重复密码" />
          </n-form-item>
          <n-form-item path="nickname" label="昵称">
            <n-input v-model:value="modalData.nickname" clearable placeholder="输入昵称" />
          </n-form-item>
          <n-form-item path="email" label="邮箱">
            <n-input v-model:value="modalData.email" clearable placeholder="输入邮箱" />
          </n-form-item>
        </n-form>
      </n-space>
      <n-space justify="end" style="width: 100%">
        <n-button :type="isEdit ? 'warning' : 'success'" @click="onModalPositiveButtonClick">
          {{ isEdit ? "修改" : "确定" }}
        </n-button>
      </n-space>
    </n-modal>

    <RoleTable v-model:show="showRoleTable" :user="selectRow!" />

    <!-- 页面内容 -->
    <n-space vertical>
      <!-- 按钮区 -->
      <n-space style="margin-bottom: 4px">
        <n-button tertiary type="info" :disabled="isLoading" @click="getData">
          <template #icon>
            <n-icon>
              <RefreshOutline />
            </n-icon>
          </template>
          刷新
        </n-button>

        <n-button tertiary type="primary" @click="onAddButtonClick">
          <template #icon>
            <n-icon>
              <AddOutline />
            </n-icon>
          </template>
          新增
        </n-button>

        <n-input-group>
          <n-input
            v-model:value="searchExpression"
            :disabled="isLoading"
            placeholder="用户名、昵称、邮箱"
            @keyup.enter="getData"
          >
            <template #prefix>
              <n-icon :component="SearchOutline" />
            </template>
          </n-input>
          <n-button ghost :disabled="isLoading || searchExpression.length === 0" @click="getData"> 搜索 </n-button>
        </n-input-group>
      </n-space>

      <!-- 表格区 -->
      <n-data-table
        remote
        striped
        :bordered="true"
        :columns="tableColumns"
        :data="tableData"
        :pagination="pagination"
        :loading="isLoading"
        @update:page="onPageChange"
        @update:page-size="onPageSizeChange"
      />
    </n-space>
  </div>
</template>
