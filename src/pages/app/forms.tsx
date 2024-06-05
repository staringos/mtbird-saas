import React from "react";
import type { NextPage } from "next";
import AppLayout from "../../layout/AppLayout";
import FormList from "../../components/FormList";
const FormsPage: NextPage = () => {
  return (
    <AppLayout>
      <FormList />
    </AppLayout>
  );
};

export default FormsPage;
