/*
 * @Author: luxiangqiang
 * @Date: 2023-09-18 12:33:12
 * @LastEditors: luxiangqiang
 * @LastEditTime: 2024-04-07 21:18:48
 */
import React, { useEffect, useRef, useState } from "react";
import { Progress, Upload, message } from "antd";
import { uploadImages } from "../../apis/upload";
import { UploadFile } from "antd/lib/upload/interface";
import styles from './style.module.less'

interface IProps {
  value: string[];
  onChange: (value: string[]) => void;
  maxCount: number;
  accept?: string;
  className?: string;
  text?: string;
}

const UploadAvatar = ({ value, onChange, maxCount, accept, className, text }: IProps) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const timeId = useRef<any>(null);

  useEffect(() => {
    if (!value) return;

    const filesList: UploadFile[] = value?.map((file, index) => {
      return {
        uid: `${index}`,
        name: file
          ? file.substring(file.lastIndexOf("/") - 1, file.length)
          : "",
        status: "done",
        url: file,
      };
    })
    setFileList(filesList);
  }, [value]);

  const handleChange = async (item: any) => {
    if (!item.fileList || item.fileList?.length <= 0) {
      return onChange([]);
    }
    onProgress(0)
    setUploading(true);
    try {
      const urls = await uploadImages(item.fileList);
      onChange(urls.map((item: any) => item.url));
    } catch (error) {
      console.error('上传文件', error)
    } finally {
      onProgress(100)
      setUploading(false);
    }
  };

  const onProgress = (percent: number) => {
    let count = progress;
    if (percent !== 100) {
      timeId.current = setInterval(() => {
        const num = Math.random() * 80;
        if (count + num < 100) {
          count = count + num;
          setProgress(count);
        } else {
          setProgress(100);
          timeId.current && clearInterval(timeId.current!);
        }
      }, 100)
    } else {
      timeId.current && clearTimeout(timeId.current!);
    }
  };

  const handlerRemoveFile = () => {
    setProgress(0)
    setUploading(false);
  }

  return (
    <div className={styles.container}>
      <Upload
        className={className}
        name="logo"
        listType="picture-card"
        accept={accept || ".png,.jpg,.jpeg"}
        fileList={fileList}
        beforeUpload={(file) => {
          const isLt5M = file.size / 1024 / 1024 < 5;
          if (!isLt5M) {
            message.error('上传的图片不能超过 5 MB!');
          }
          return isLt5M || Upload.LIST_IGNORE;
        }}
        onChange={handleChange}
        onRemove={handlerRemoveFile}
      >
        {
          uploading ? (
            <div className={styles.uploading}>
              <Progress
                percent={progress}
                style={{ marginTop: 10, width: 80 }}
                showInfo={false}
              />
              <span>上传中</span>
            </div>
          ) :
            fileList?.length < (maxCount as number) ?
              <div>
                <p>+</p>
                <p style={{ color: '#ccc' }}>{text || '上传图片'}</p>
              </div>
              : ""
        }
      </Upload>
    </div>
  );
};

export default UploadAvatar;
