import React from "react";
import TeamVersionUpgrade from "../../../components/TeamVersionUpgrade";
import ManagerLayout from "../../../layout/ManagerLayout";

const TeamUpgradePage = () => {
  return (
    <ManagerLayout type="team">
      <TeamVersionUpgrade />
    </ManagerLayout>
  );
};

export default TeamUpgradePage;
