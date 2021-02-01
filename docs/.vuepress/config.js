module.exports = {
  lang: "zh-CN",
  title: "你好， VuePress ！123",
  description: "这是我的第一个 VuePress 站点",

  base: "/",

  markdown: {
    lineNumbers: false, // 代码块显示行号
  },

  themeConfig: {
    logo: "https://vuejs.org/images/logo.png",
    nav: [
      { text: "Home", link: "/" },
      { text: "Guide", link: "/guide/" },
      { text: "External", link: "https://google.com" },
    ],
    sidebar: "auto", // 侧边栏配置
    sidebarDepth: 2, // 侧边栏显示2级
  },
};
