const getConfig = require("vuepress-bar");
const { config } = require("vuepress-theme-hope");

const { nav, sidebar } = getConfig({
  addReadMeToFirstGroup: false
});

const NAV_TEXT_CONFIG = {
  Api: "API",
  Guide: "指南",
  Articles: "知识地图"
};

nav.forEach(item => {
  const text = item.text;
  if (NAV_TEXT_CONFIG[text]) {
    item.text = NAV_TEXT_CONFIG[text];
  }
});

const newNav = [
  ...nav,
  {
    text: "Github",
    link: "https://github.com/kaokei/use-vue-service"
  }
];

// console.log('JSON.stringify(newNav, null, 4) :>> ', JSON.stringify(newNav, null, 4));

module.exports = config({
  lang: "zh-CN",
  title: "@kaokei/use-vue-service",
  description: "这是我的第一个 VuePress 站点",

  base: "/",

  markdown: {
    lineNumbers: true // 代码块显示行号
  },

  themeConfig: {
    logo: "/logo.png",
    nav: newNav,
    sidebar,
    hostname: "https://use-vue-service-docs.vercel.app/",
    anchorDisplay: false
  }
});
