<img src="./packages/mtbird-storybook/src/assets/images/logo-banner.png" />

<div align="center">
  <h3>你心所想，即是应用</h3>
  <a href="https://mtbird.staringos.com">免费使用</a> | <a href="https://staringos.com">官网</a> ｜ <a href="https://docs.staringos.com">文档</a> ｜ <a href="/story/demos-编辑器--form-page">
    Demo
  </a>｜ <a href="https://github.com/staringos">Github</a>
</div>
<br />
<div align="center">

[![license](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat)](https://github.com/staringos/mtbird)
[![Release Version](https://img.shields.io/badge/release-0.0.1-green.svg)](https://github.com/staringos/mtbird/releases)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/staringos/mtbird/pulls)
[![Community](https://img.shields.io/discord/733027681184251937.svg?style=flat&label=Join%20Community&color=7289DA)](https://discord.gg/7V5vnHW2)

</div>

# 星搭精卫

星搭精卫 MtBird 是一款低代码可视化页面生成器。我们帮助用户以可视化的形式搭建网页、小程序和表单等应用。这个星搭精卫的 SaaS 项目，包含全部接口。我们前端编辑器、渲染器已经独立成一个纯前端项目，详细可以查看这里 [mtbird editor](https://github.com/staringos/mtbird)

[English](./README.md)

<img src="https://mtbird-cdn.staringos.com/modal.gif" />

<img src="./packages/mtbird-storybook/src/assets/images/advance.png" />

<p></p>

## 快速开始

需要 NodeJS 版本: >=18

```shell
git clone https://github.com/staringos/mtbird-saas
```

从 `.env` 修改配置文件

```shell
# mysql 数据库链接
DATABASE_URL="mysql://"

# 七牛云地址 for CDN
QINIU_ACCESS_KEY=
QINIU_SECRET_KEY=
BUCKET=
BUCKET_REGISTRY=

# CDN URL
NEXT_PUBLIC_CDN_URL=

```

启动服务

```shell
yarn build-compose
yarn up-compose

```

初始化数据库

```shell
yarn run db-push
yarn run db-seed
```

在浏览器打开: http://localhost:3000/

本地开发 mtbird 相关包，请查看 [这个文档](https://github.com/staringos/mtbird/tree/master/packages/mtbird-example)

## 常用资料

- 📃 页面绑定自定义域名，点击了解 [绑定域名](https://docs.staringos.com/?path=/docs/%E7%BC%96%E8%BE%91%E5%99%A8-%E7%BB%91%E5%AE%9A%E5%9F%9F%E5%90%8D--page)

- 🌟 快速了解星搭拓展开发，可以从这里开始 [快速开始](https://docs.staringos.com/?path=/docs/%E6%8B%93%E5%B1%95-%E4%BB%8B%E7%BB%8D--page)

- ⌚️ 快速了解业务系统接入星搭编辑器，可以从这里了解 [嵌入编辑器](https://docs.staringos.com/?path=/docs/%E7%BC%96%E8%BE%91%E5%99%A8-%E5%B5%8C%E5%85%A5%E7%BC%96%E8%BE%91%E5%99%A8--page)

- 🌺 快速了解业务系统接入星搭渲染器，可以从这里入门 [嵌入渲染系统](https://docs.staringos.com/?path=/docs/%E6%B8%B2%E6%9F%93%E5%99%A8-%E5%B5%8C%E5%85%A5%E6%B8%B2%E6%9F%93%E5%99%A8--page)

## 文档目录

- [拓展](https://docs.staringos.com/?path=/docs/%E6%8B%93%E5%B1%95-%E4%BB%8B%E7%BB%8D--page)
- [编辑器](https://docs.staringos.com/?path=/docs/%E7%BC%96%E8%BE%91%E5%99%A8-%E4%BB%8B%E7%BB%8D--page)
- [渲染器](https://docs.staringos.com/?path=/docs/%E6%B8%B2%E6%9F%93%E5%99%A8-%E4%BB%8B%E7%BB%8D--page)
- [DEMO](https://docs.staringos.com/?path=/docs/demos-%E7%BC%96%E8%BE%91%E5%99%A8--form-page)
- [参与开源贡献](https://docs.staringos.com/?path=/docs/demos-%E7%BC%96%E8%BE%91%E5%99%A8--form-page)
- [APIs](https://docs.staringos.com/?path=/docs/apis-%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84-%E7%BB%84%E4%BB%B6--page)
- [联系我们](https://docs.staringos.com/?path=/docs/%E6%9C%8D%E5%8A%A1-%E8%81%94%E7%B3%BB%E6%88%91%E4%BB%AC--page)

## Contributing

PRs & Issues are all welcome, feel free to ask question or submit your code.

[CONTRIBUTING](./CONTRIBUTING.md)

## 加入社群

<img src="https://github.com/staringos/staringai-mini-program/raw/master/images/ew-qrcode.jpg" width="160px" />
