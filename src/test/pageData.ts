import type { IPageConfig } from "@mtbird/shared";

export const page: any = {
  id: "123",
  title: "新页面",
  headImage: "https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png",
  data: {
    id: "123333",
    type: "container",
    componentName: "ContainerRoot",
    parent: "123",
    props: {
      style: {
        fontSize: 12,
        position: "relative",
        width: "100%",
        height: "100%",
        zIndex: 0,
      },
    },
    children: [
      {
        id: "443454",
        type: "container",
        parent: "123333",
        componentName: "ContainerBlock",
        props: {
          style: {
            height: 400,
          },
        },
        children: [
          {
            id: "567567",
            type: "component",
            parent: "443454",
            componentName: "Text",
            props: {
              style: {
                width: 200,
                height: 100,
                position: "absolute",
                top: 0,
                left: 0,
                zIndex: 0,
              },
            },
            children: "这是一段文本呀呀呀",
          },
        ],
      },
    ],
  },
};
