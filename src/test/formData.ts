const FORM_DATA = {
  id: "123333",
  type: "container",
  componentName: "ContainerRoot",
  layout: "flex",
  parent: "123",
  props: {
    style: {
      fontSize: 12,
      position: "relative",
      width: "100%",
      height: "100%",
      zIndex: 0,
    },
    className: "mtbird-flex-component",
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
          position: "relative",
        },
        className: "relative",
      },
      children: [
        {
          type: "form",
          componentName: "Form",
          layout: "flex",
          formConfig: {
            formLayout: "horizontal",
          },
          props: {
            style: {
              position: "relative",
              width: 299,
              height: 280,
              top: 106,
              left: 40,
              bottom: -48,
              right: 66,
            },
            className: "mtbird-flex-component mtbird-selectable-component",
          },
          children: [
            {
              type: "form",
              componentName: "Input",
              formConfig: {
                label: "文本",
                componentProps: {
                  placeholder: "请输入文本",
                },
              },
              props: {
                style: {
                  position: "relative",
                  height: 35,
                },
                className: "relative",
              },
              children: [],
              id: "AifEdL8IDszYz5l_XiQSi",
              parent: "NL_1Ns5phaP9tmNnRSBy2",
            },
            {
              type: "form",
              componentName: "TextArea",
              formConfig: {
                label: "多行文本",
                componentProps: {
                  placeholder: "请输入文本",
                },
              },
              props: {
                style: {
                  position: "relative",
                  height: 100,
                },
                className: "relative",
              },
              children: [],
              id: "jvBOsn9hjVEKwWK2sIaWw",
              parent: "NL_1Ns5phaP9tmNnRSBy2",
            },
            {
              type: "form",
              componentName: "Button",
              props: {
                style: {
                  position: "relative",
                  height: 40,
                  width: 300,
                },
                type: "primary",
                shape: "default",
                className: "relative",
              },
              events: {
                click: {
                  type: "submit",
                  src: "http://staringos.com",
                },
              },
              children: "按钮",
              id: "gPz1cO8LVbP5xq0lzkcHU",
              parent: "NL_1Ns5phaP9tmNnRSBy2",
            },
          ],
          id: "NL_1Ns5phaP9tmNnRSBy2",
          parent: "443454",
        },
        {
          type: "form",
          componentName: "Text",
          props: {
            style: {
              position: "absolute",
              height: 30,
              width: 197,
              top: 53,
              left: 83,
              bottom: -17,
              right: 47,
            },
            className: "mtbird-component mtbird-selectable-component",
          },
          children: '<h2 style="text - align: center">报名表单</h2>',
          id: "G45Gt7H4JzCkexU9Ef9eX",
          parent: "443454",
        },
      ],
    },
  ],
};

export default FORM_DATA;
