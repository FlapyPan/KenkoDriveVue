/* eslint-env node */
require("@rushstack/eslint-patch/modern-module-resolution")

const config = {
  root: true,
  extends: [
    "plugin:vue/vue3-recommended", // 使用推荐的规则
    "eslint:recommended",
    "@vue/eslint-config-typescript",
    "@vue/eslint-config-prettier/skip-formatting",
  ],
  parserOptions: {
    ecmaVersion: "latest",
  },
  rules: {
    semi: ["warn", "never"], // 分号
    indent: ["error", 2, { // 缩进，2个空格
      SwitchCase: 1, // switch语句缩进1个单位
      offsetTernaryExpressions: true //三元表达式缩进
    }],
    quotes: ["error", "double"], // 引号
    "object-shorthand": ["off", "consistent"], // 对象字面量简写语法

    "no-unused-vars": "off", // 禁止未使用过的变量。已禁用，使用typescript检查
    "no-undef": "off", // 禁止未声明的变量。已禁用，使用typescript检查
    "no-var": "error", // 禁止使用 var

    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-console": process.env.NODE_ENV === "production" ? "error" : "off",

    "vue/multi-word-component-names": "off", // 组件名必须是多个单词
  },
}

module.exports = config
