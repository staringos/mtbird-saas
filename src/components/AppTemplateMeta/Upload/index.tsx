import React, { useMemo } from "react";

import UploadAvatar from "./../../UploadAvatar";

type Props = {
  value?: string;
  onChange?: (id: string) => void;
};

const Upload = ({ value, onChange }: Props) => {
  const files = useMemo(() => {
    return [value].filter(Boolean) as string[];
  }, [value]);

  return (
    <UploadAvatar
      files={files}
      onChange={(e) => onChange?.(e[0])}
      maxCount={1}
    />
  );
};

export default Upload;
