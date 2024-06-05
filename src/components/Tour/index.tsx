import React from "react";
import { Tour } from "antd";
import { observer } from "mobx-react-lite";
import { useStore } from "../../store";
import styles from "./style.module.less"
import { getTabFromInnerText } from "@mtbird/core";

const steps = [
  {
    title: "👏 欢迎使用星搭",
    cover: (
      <img
        alt="tour.png"
        src="https://mtbird-cdn.staringos.com/product/movies/example-mini-2.gif"
      />
    ),
    description:
      "为了让您更快上手使用，我们用两分钟，引导您使用基础的功能。如果您已经熟悉了星搭的使用，可以点击右上角的按钮关闭引导",
    target: null,
  },
  {
    title: "新建页面",
    description: (
      <p>
        点击创建页面按钮会进入页面模版面板，在页面模版面板中选择页面类型：
        <br />- H5页面：移动端页面
        <br />- PC页面：电脑端页面（网站）
        <br />- 表单：表单填报或线索收集。
        <br />
        确定页面类型和对应的模版，输入页面名称，点击创建页面
      </p>
    ),
    cover: (
      <img
        alt="tour.png"
        src="https://mtbird-cdn.staringos.com/product/assets/TourSaaSCreatePage.png"
      />
    ),
    target: () => document.getElementById("createPageBtn") as any,
  },
  {
    title: "编辑页面",
    description: "点击编辑页面按钮会进入到页面编辑器，编辑页面样式.",
    cover: (
      <img
        alt="tour.png"
        src="https://mtbird-cdn.staringos.com/product/movies/example-mini-2.gif"
      />
    ),
    target: () => document.getElementById("editPageBtn") as any,
  },
  {
    title: "预览页面",
    description:
      "点击预览页面按钮，可以到页面预览中，查看页面编辑成果，可以展示页面在不同大小屏幕上的显示效果，并发布页面.",
    cover: (
      <img
        alt="tour.png"
        src="https://mtbird-cdn.staringos.com/product/assets/TourPreviewPage.png"
      />
    ),
    target: () =>
      document.getElementsByClassName("pageCardContainer")?.[0] as any,
  },
  {
    title: "编辑页面SEO信息",
    description:
      "点击页面卡片下方的 ... -> 页面信息 菜单，可以修改页面的标题、描述、Tag 等信息，已经微信分享的图片",
    cover: (
      <img
        alt="tour.png"
        src="https://mtbird-cdn.staringos.com/product/assets/pageInfoEdit.png"
      />
    ),
    target: () => document.getElementById("pageMoreBtn") as any,
  },
  {
    title: "应用信息设置",
    description:
      "在设置页面，可以对应用的基本信息 名称、描述、头像等进行设置，并可以绑定域名、删除应用",
    cover: (
      <img
        alt="tour.png"
        src="https://mtbird-cdn.staringos.com/product/assets/TourSettingPage.png"
      />
    ),
    target: () => getTabFromInnerText("设置") as any,
  },
  {
    title: "查看表单数据",
    description:
      "在 表单数据 页面，可以查看页面的表单数据，并对数据进行删除等操作.",
    cover: (
      <img
        alt="tour.png"
        src="https://mtbird-cdn.staringos.com/product/assets/FourFormPage.png"
      />
    ),
    target: () => getTabFromInnerText("表单数据") as any,
  },
  {
    title: "发布 网页应用/小程序",
    description:
      "点击 发布应用，可以查看网页应用的发布信息，并进行小程序的发布操作.",
    cover: (
      <img
        alt="tour.png"
        src="https://mtbird-cdn.staringos.com/product/assets/TourPublishApp.png"
      />
    ),
    target: () => document.getElementById("publishBtn") as any,
  },
  {
    title: "🎆 完成引导",
    description: (
      <p>
        🎉
        恭喜，您已经完成基础引导，快去体验无代码编辑吧！～如想进一步了解，可以查看
        <a href="https://docs.staringos.com">星搭文档中心</a>.
      </p>
    ),
    cover: (
      <img
        alt="tour.png"
        src="https://mtbird-cdn.staringos.com/product/assets/TourCover1.jpg"
      />
    ),
  },
];

const TourComponent = observer(() => {
  const { tourState, toggleTourState } = useStore();

  const handleClose = () => {
    toggleTourState();
  };

  return (
    <Tour open={tourState} rootClassName={styles.tour} onClose={handleClose} steps={steps} type="primary" />
  );
});

export default TourComponent;
