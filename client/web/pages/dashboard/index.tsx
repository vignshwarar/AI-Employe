import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";

import LoggedInLayout from "@/components/molecules/Layout/LoggedInLayout";

const Dashboard: NextPage = () => {
  return (
    <LoggedInLayout>
      <h1
        style={{
          color: "white",
        }}
      >
        Dashboard
      </h1>
    </LoggedInLayout>
  );
};

export default Dashboard;
