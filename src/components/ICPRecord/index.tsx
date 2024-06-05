import { useMemo } from "react";
import styles from "./style.module.less";


const RecordInfo: { [key: string]: string } = {
  "staringos.com": "京ICP备2021004211号-3",
  "staringai.com": "京ICP备2021004211号-5",
};

const ICP = () => {
  const domain = useMemo(() => {
    if (typeof window === "undefined") return;

    return RecordInfo[location.hostname.split(".").slice(-2).join(".")] || RecordInfo["staringai.com"];
  }, []);

  return (
    <div className={styles.icpRecord}>
      <a href="https://beian.miit.gov.cn/" target="_blank" rel="noreferrer">
        {domain}
      </a>
    </div>
  );
};

export default ICP;
