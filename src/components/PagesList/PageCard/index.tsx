import React from "react";
import { Card, Dropdown, Menu, message, Modal, Tag } from "antd";
import styles from "./style.module.less";
import {
  EditOutlined,
  EllipsisOutlined,
  FullscreenOutlined,
  DeleteOutlined,
  MobileOutlined,
  DesktopOutlined,
  ProfileOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { IPage } from "types/entities/Page";
import { observer } from "mobx-react-lite";
import { useStore } from "store";
import { deletePage } from "apis";
import ShareDropdown from "../../ShareDropdown";
import { IPageConfig } from "@mtbird/shared/dist/types";
const { confirm } = Modal;

interface IProps {
  page: IPage;
  onSaveTemplate: (page: IPageConfig) => void;
  onToCopy: (page: IPage) => void;
  onSetHomePage: (pageId: string) => void;
}

const PageCard = observer(
  ({ page, onSaveTemplate, onToCopy, onSetHomePage, onToEdit }: IProps) => {
    const { getPages, currentAppId, currentApp } = useStore();
    const handleClick = () => {
      if (page.isNativePage)
        return message.warning(
          "原生页面不可预览，请点击右上角 ➡️ 发布按钮，发布到小程序预览!"
        );
      location.href = `/preview/${page.id}`;
    };

    const handleToEdit = (e: any) => {
      e.preventDefault();
      if (page.isNativePage) return message.warning("原生页面不可编辑!");
      location.href = `/editor/${page.id}`;
    };

    const handleDelete = async () => {
      if (page.isNativePage) return message.warning("原生页面不可删除!");
      confirm({
        icon: <DeleteOutlined />,
        content: "确定要删除这个页面吗?",
        async onOk() {
          const hide = message.loading("Loading...", 0);
          await deletePage(page.id as string);
          message.success("删除成功");
          hide();
          await getPages(currentAppId);
        },
      });
    };

    const menuItems = [
      {
        label: (
          <a
            rel="noopener noreferrer"
            href="javascript:void(0);"
            onClick={() => onToEdit(page)}
          >
            页面信息
          </a>
        ),
      },
      {
        label: (
          <ShareDropdown page={page}>
            <a href="javascript: void(0);" rel="noopener noreferrer">
              分享
            </a>
          </ShareDropdown>
        ),
      },
      {
        label: (
          <a
            rel="noopener noreferrer"
            href="javascript:void(0);"
            onClick={() => onToCopy(page)}
          >
            复制
          </a>
        ),
      },
      {
        label: (
          <a
            rel="noopener noreferrer"
            href="javascript:void(0);"
            onClick={() => onSaveTemplate(page)}
          >
            保存模版
          </a>
        ),
      },
      {
        label: (
          <a
            rel="noopener noreferrer"
            href="javascript:void(0);"
            onClick={handleDelete}
          >
            删除
          </a>
        ),
      },
    ];

    if (currentApp.homePageId !== page.id) {
      menuItems.splice(2, 0, {
        label: (
          <a
            rel="noopener noreferrer"
            href="javascript:void(0);"
            onClick={() => onSetHomePage(page.id)}
          >
            设为首页
          </a>
        ),
      });
    }

    const menu = <Menu items={page.isNativePage ? [] : (menuItems as any)} />;

    return (
      <Card
        className={styles.pageCardContainer + " pageCardContainer"}
        hoverable
        style={{ width: 240 }}
        actions={[
          <FullscreenOutlined
            key="setting"
            onClick={handleClick}
            disabled={page.isNativePage}
          />,
          <EditOutlined
            key="edit"
            id="editPageBtn"
            onClick={handleToEdit}
            disabled={page.isNativePage}
          />,
          <Dropdown
            overlay={menu}
            placement="bottomLeft"
            key="list"
            disabled={page.isNativePage}
          >
            <EllipsisOutlined key="ellipsis" id="pageMoreBtn" />
          </Dropdown>,
        ]}
        cover={
          <img
            onClick={handleClick}
            className={styles.pageCardImage}
            alt="example"
            src={
              page.avatar ||
              "https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png"
            }
          />
        }
      >
        <h3>
          {page.title}
          {page.isNativePage && <Tag>原生</Tag>}

          {currentApp.homePageId === page.id && (
            <HomeOutlined className={styles.pageTypeIcon} title="首页" />
          )}
          {page.type === "mobile" && (
            <MobileOutlined className={styles.pageTypeIcon} title="手机页面" />
          )}
          {page.type === "pc" && (
            <DesktopOutlined className={styles.pageTypeIcon} title="官网页面" />
          )}
          {page.type === "form" && (
            <ProfileOutlined className={styles.pageTypeIcon} title="表单页面" />
          )}
        </h3>
      </Card>
    );
  }
);

export default PageCard;
