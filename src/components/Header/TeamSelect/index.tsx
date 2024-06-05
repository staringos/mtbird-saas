import React from "react";
import { Select } from "antd";
import styles from "../AppSelect/style.module.less";
import { observer } from "mobx-react-lite";
import { useStore } from "store";
import ITeam from "types/entities/Team";

const { Option } = Select;

const TeamSelect = observer(() => {
  const { teams, currentTeamId, setCurrentTeam } = useStore();
  const handleChange = (cur: any) => {
    setCurrentTeam(cur);
  };

  return (
    <div className={styles.selectContainer}>
      <Select
        className={styles.select}
        value={currentTeamId}
        onChange={handleChange}
      >
        {teams &&
          teams.map((cur: ITeam) => (
            <Option value={cur.id} key={cur.id}>
              {cur.name}
            </Option>
          ))}
      </Select>
    </div>
  );
});

export default TeamSelect;
