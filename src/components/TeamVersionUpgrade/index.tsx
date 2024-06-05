import React, { useEffect, useMemo, useState } from "react";
import styles from "./style.module.less";
import UpgradeBox, { IBox } from "./UpgradeBox";
import { Col, Radio, Row, Spin, Typography } from "antd";
import { observer } from "mobx-react-lite";
import { useStore } from "store";
import { PackageList, PAY_PERIOD_OPTIONS } from "../../utils/constants";
import { getGoods } from "apis/order";
import { getTeamVersionList } from "../../utils";

const { Title, Text } = Typography;

const TeamVersionUpgrade = observer(() => {
  const { currentTeam, openModal } = useStore();
  const curVersion = currentTeam?.version || "normal";
  const [goods, setGoods] = useState([]);
  const [period, setPeriod] = useState("monthly");
  const [isLoading, setIsLoading] = useState(false);

  const versionList = useMemo(() => {
    if (!goods || goods.length === 0) return [];
    const versionList = getTeamVersionList(goods, period);

    switch (curVersion) {
      case "private":
        versionList[3].buttonDisabled = true;
        versionList[3].buttonTitle = "当前计划";
        versionList[2].buttonDisabled = true;
      case "enterprise":
        versionList[2].buttonDisabled = true;
        if (curVersion === "enterprise")
          versionList[2].buttonTitle = "当前计划";
        versionList[1].buttonDisabled = true;
      case "professional":
        versionList[1].buttonDisabled = true;
        if (curVersion === "professional")
          versionList[1].buttonTitle = "当前计划";
        versionList[0].buttonDisabled = true;
      case "normal":
        versionList[0].buttonDisabled = true;
        if (curVersion === "normal") versionList[0].buttonTitle = "当前计划";
        break;
    }

    return versionList;
  }, [period, goods, curVersion]);

  const init = async () => {
    setIsLoading(true);
    const res = await getGoods();
    setGoods(res.data);
    setIsLoading(false);
  };

  useEffect(() => {
    init();
  }, []);

  const handleRadioChange = (e) => {
    setPeriod(e.target.value);
  };

  return (
    <Spin spinning={isLoading}>
      <div className={styles.upgradeContainer}>
        <div className={styles.upgradeRow}>
          <Title level={3} style={{ alignSelf: "flex-start" }}>
            自己动手，体验团队创作
          </Title>
          <Text style={{ marginBottom: "20px" }}>
            高效无代码应用搭建，全程web操作，在线数据及API可视化对接，一键生成小程序
          </Text>
          <Radio.Group
            options={PAY_PERIOD_OPTIONS}
            onChange={handleRadioChange}
            value={period}
            optionType="button"
            buttonStyle="solid"
          />
          <div className={styles.upgradeList}>
            {versionList.map((cur: IBox, i: number) => {
              return <UpgradeBox box={cur} key={i} openModal={openModal} />;
            })}
          </div>
        </div>
        {/* <div className={styles.upgradeRow}>
          <Title
            level={3}
            style={{ alignSelf: "flex-start", marginTop: "50px" }}
          >
            雇佣专家，快速实现需求
          </Title>
          <Text>
            雇佣星搭技术专家，无需您亲自动手，为您完成从产品设计、UI设计到搭建的全流程。所见即所得，在技术专家的帮助下结合高效的无代码搭建，
            <br />
            帮助您实现快速上线
          </Text>
          <div className={styles.upgradeList}>
            {PackageList.map((cur: IBox, i: number) => {
              return <UpgradeBox box={cur} key={i} openModal={openModal} />;
            })}
          </div>
        </div> */}
      </div>
    </Spin>
  );
});

export default TeamVersionUpgrade;
