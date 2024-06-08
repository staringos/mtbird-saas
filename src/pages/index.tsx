import React, { useState } from "react";
import type { NextPage } from "next";
import PagesList from "../components/PagesList";
import AppLayout from "../layout/AppLayout";
import PageRender from "@/components/PageRender";
import TourComponent from "../components/Tour";
import ICPRecord from "@/components/ICPRecord";

export async function getServerSideProps(context) {
  let [wildcard, scope, ...rest] = context.req.headers.host.split(".");
  if (
    wildcard === "mtbird" ||
    scope === "staringos" ||
    wildcard === "localhost:9898" ||
    wildcard === "localhost:8888" ||
    wildcard === "localhost:3000" ||
    (rest as string[]).join('.').endsWith("staringos.com")
  ) {
    return { props: { wildcard: "mtbird", isInstall: process.env.NEXT_PUBLIC_IS_INSTALL || 'false' } };
  }

  return { props: { wildcard, isInstall: process.env.NEXT_PUBLIC_IS_INSTALL || 'false' } };
}

interface IProps {
  wildcard: string;
  isInstall: boolean;
}

const Home: NextPage = (props: IProps | any) => {
  if (typeof window === 'undefined') return null;
  if (props.isInstall != "true" && location.pathname !== "/install-welcome") {
    // router.replace('/install-welcome')
    location.href = "/install-welcome";
    return;
  }

  if (props.wildcard !== "mtbird") {
    return <PageRender preview={false} appId={props.wildcard} />;
  }

  return (
    <AppLayout>
      <PagesList />
      <TourComponent />
      <ICPRecord />
    </AppLayout>
  );
};

export default Home;
