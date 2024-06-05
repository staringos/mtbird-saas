import React from "react";
import IndexLayout from "..";

interface IProps {
  children: any;
  loading?: boolean;
}

const EditorLayout = ({ children, loading }: IProps) => {
  return <IndexLayout hideHeader={true}>{children}</IndexLayout>;
};

export default EditorLayout;
