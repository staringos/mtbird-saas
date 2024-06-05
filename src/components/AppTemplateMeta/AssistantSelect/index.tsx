import { Card, Input, Pagination, Spin, Tabs } from "antd";
import Image from "next/image";
import React, { useEffect, useRef, useState, useCallback } from "react";

import { getAssistantList } from "../../../apis/ai";
import { IAssistant } from "./../../../types/entities/Ai";
import clsx from "./../../../utils/clsx";
import AssistantCard from "./AssistantCard";

import styles from "./index.module.less";
import Link from "next/link";

const { Search } = Input;

type Props = {
  value?: string;
  onChange?: (id: string) => void;
};

const PageSize = 9;

const AssistantSelect = ({ value, onChange }: Props) => {
  const pageNumberRef = useRef(1);
  const [total, setTotal] = useState(0);
  const [assistantList, setAssistantList] = useState<IAssistant[]>([]);
  const [assistantType, setAssistantType] = useState("");

  const [searchValue, setSearchValue] = useState("");
  const [listLoading, setListLoading] = useState(false);

  const fetchAssistant = useCallback(
    async (query?: string) => {
      setListLoading(true);
      try {
        const data = await getAssistantList(assistantType, {
          pageNum: pageNumberRef.current,
          pageSize: PageSize,
          query,
        });
        if (data.code === 200) {
          setTotal((data as any).total);
          setAssistantList(data.data);
        }
      } catch (error) {
        
      } finally {
        setListLoading(false);
      }
    },
    [assistantType]
  );

  useEffect(() => {
    fetchAssistant();
  }, [fetchAssistant, assistantType]);

  const onSelect = (assistant: IAssistant) => {
    onChange?.(assistant.id);
  };

  const onSearchChange = (evt: any) => {
    setSearchValue(evt.target.value);
  };

  const onSearchClick = () => {
    pageNumberRef.current = 1;
    fetchAssistant(searchValue);
  };

  const onPaginationChange = (page: number) => {
    pageNumberRef.current = page;
    fetchAssistant(searchValue);
  };

  return (
    <div className={styles.assistantWrap}>
      <div className={styles.searchBar}>
        <Search
          placeholder="请输入助手名称或介绍"
          allowClear
          value={searchValue}
          onChange={onSearchChange}
          onSearch={onSearchClick}
          style={{ width: 300 }}
        />
        <div className={styles.links}>
          <a target="_blank"  href="https://staringos.feishu.cn/wiki/YdUDwDBm6iQ6mHkl3xpcNlc2n5e" rel="noreferrer">什么是助手？</a>
          <a
            target="_blank"
            href="https://staringai.com/assistant/create"
            rel="noreferrer"
          >
            创建助手
          </a>
        </div>
      </div>
      <Tabs
        activeKey={assistantType}
        size="small"
        items={[
          { label: "助手市场", key: "" },
          { label: "我的助手", key: "my" },
        ]}
        onChange={(key) => {
          pageNumberRef.current = 1;
          setAssistantType(key);
        }}
      />
      {!listLoading && !assistantList.length && assistantType === "my" && (
        <div className={styles.empty}>
          暂无数据，
          <a
            className={styles.link}
            target="_blank"
            href="https://staringai.com/assistant/create"
            rel="noreferrer"
          >
            前往创建
          </a>
        </div>
      )}
      <Spin spinning={listLoading}>
        <div className={styles.assistant}>
          {assistantList.map((assistant) => {
            return (
              <AssistantCard
                key={assistant.id}
                data={assistant}
                onClick={onSelect}
                selectedId={value}
              />
            );
          })}
        </div>
      </Spin>
      <div className={styles.pagination}>
        <Pagination
          size="small"
          showSizeChanger={false}
          pageSize={PageSize}
          current={pageNumberRef.current}
          onChange={onPaginationChange}
          total={total}
        />
      </div>
    </div>
  );
};

export default AssistantSelect;
