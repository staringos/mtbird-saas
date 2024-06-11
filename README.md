<img src="https://github.com/staringos/mtbird/packages/mtbird-storybook/src/assets/images/logo-banner-en.png" />

<div align="center">
  <a href="https://mtbird.staringos.com?f=mbrm">Use for free</a> | <a href="https://staringos.com?f=mbrm">Website</a> ｜ <a href="https://docs.staringos.com?f=mbrm">Docs</a> ｜ <a href="/story/demos-编辑器--form-page">
    Demo
  </a>｜ <a href="https://github.com/staringos/mtbird-saas">Github</a>
</div>
<br />
<div align="center">

[![license](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat)](https://github.com/staringos/mtbird)
[![Release Version](https://img.shields.io/badge/release-0.0.1-green.svg)](https://github.com/staringos/mtbird/releases)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/staringos/mtbird/pulls)
[![Community](https://img.shields.io/discord/733027681184251937.svg?style=flat&label=Join%20Community&color=7289DA)](https://discord.gg/7V5vnHW2)

</div>

# MtBird [中文文档](./README-CN.md)

MtBird-SaaS is a low-code platform for HTML Page、Website. We help to build page without code or less code. It also support Wechat Mini-Program. This is fully repository, the main frontend editor is isolated, see this [mtbird editor](https://github.com/staringos/mtbird)

<img src="https://mtbird-cdn.staringos.com/product/movies/example-mini-2.gif" />

<img src="./packages/mtbird-storybook/src/assets/images/advance-en.png" />

<p></p>

[Online Product](https://mtbird.staringos.com)

## Getting Start

```shell
git clone https://github.com/staringos/mtbird-saas
```

### 1. Start in docker

Start server

```shell
yarn build-compose
yarn up-compose
```

### 2. Start Manually

Require NodeJS version: >=18

1. Install dependencies

```shell
yarn
```

2. Start server

```shell
yarn run start
```

## Configuration

Config file from `.env`

Requirement:

```shell
# mysql 数据库链接
DATABASE_URL="mysql://"

# Qiniu Cloud for CDN
QINIU_ACCESS_KEY=
QINIU_SECRET_KEY=
BUCKET=
BUCKET_REGISTRY=

# CDN URL
NEXT_PUBLIC_CDN_URL=
```

Open: http://localhost:3000/

Develop mtbird library mode see [this document](https://github.com/staringos/mtbird/tree/master/packages/mtbird-example)

## More Usage

- Fontend Editor component [mtbird](https://github.com/staringos/mtbird)

- 📃 Bind your domain name [Bind Domain](https://docs.staringos.com/?path=/docs/%E7%BC%96%E8%BE%91%E5%99%A8-%E7%BB%91%E5%AE%9A%E5%9F%9F%E5%90%8D--page)

- 🌟 Develop mtbird extension [Getting Start](https://docs.staringos.com/?path=/docs/%E6%8B%93%E5%B1%95-%E4%BB%8B%E7%BB%8D--page)

- ⌚️ Emb Editor in your project or SaaS service [Embed Editor](https://docs.staringos.com/?path=/docs/%E7%BC%96%E8%BE%91%E5%99%A8-%E5%B5%8C%E5%85%A5%E7%BC%96%E8%BE%91%E5%99%A8--page)

- 🌺 Know how to embed MtBird Renderer [Embed Renderer](https://docs.staringos.com/?path=/docs/%E6%B8%B2%E6%9F%93%E5%99%A8-%E5%B5%8C%E5%85%A5%E6%B8%B2%E6%9F%93%E5%99%A8--page)

## Docs

- [Extension](https://docs.staringos.com/?path=/docs/%E6%8B%93%E5%B1%95-%E4%BB%8B%E7%BB%8D--page)
- [Editor](https://docs.staringos.com/?path=/docs/%E7%BC%96%E8%BE%91%E5%99%A8-%E4%BB%8B%E7%BB%8D--page)
- [Renderer](https://docs.staringos.com/?path=/docs/%E6%B8%B2%E6%9F%93%E5%99%A8-%E4%BB%8B%E7%BB%8D--page)
- [DEMO](https://docs.staringos.com/?path=/docs/demos-%E7%BC%96%E8%BE%91%E5%99%A8--form-page)
- [Contributing](https://docs.staringos.com/?path=/docs/demos-%E7%BC%96%E8%BE%91%E5%99%A8--form-page)
- [APIs](https://docs.staringos.com/?path=/docs/apis-%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84-%E7%BB%84%E4%BB%B6--page)
- [Contact Us](https://docs.staringos.com/?path=/docs/%E6%9C%8D%E5%8A%A1-%E8%81%94%E7%B3%BB%E6%88%91%E4%BB%AC--page)

## Contributing

PRs & Issues are all welcome, feel free to ask question or submit your code.

[CONTRIBUTING](./CONTRIBUTING.md)
