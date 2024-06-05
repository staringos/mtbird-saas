import React, { useEffect, useState } from "react";
import { Upload } from "antd";
import { uploadImages } from "apis/upload";
import { UploadFile } from "antd/lib/upload/interface";

interface IProps {
  files: string[];
  onChange: (value: string[]) => void;
  maxCount: number;
  accept?: string;
}

const UploadAvatar = ({ files, onChange, maxCount, accept }: IProps) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    if (!files) return;

    setFileList(
      files.map((file) => {
        return {
          uid: "-1",
          name: file
            ? file.substring(file.lastIndexOf("/") - 1, file.length)
            : "",
          status: "done",
          url: file,
        };
      })
    );
  }, [files]);

  const handleChange = async ({ fileList: newFileList }: any) => {
    if (!newFileList || newFileList.length <= 0) {
      return onChange([]);
    }

    const urls = await uploadImages(newFileList);

    onChange(urls);
  };

  return (
    <Upload
      name="logo"
      onChange={handleChange}
      listType="picture-card"
      accept={accept || ".png,.jpg,.jpeg"}
      fileList={fileList}
    >
      {/* {files?.length ? files.map((cur: string) => <img src={cur} key={cur} alt="avatar" style={{ width: '100%' }} />) : ''} */}
      {files?.length < (maxCount as number) ? "+" : ""}
    </Upload>
  );
};

export default UploadAvatar;
