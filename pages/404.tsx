import React from "react";
import type { NextPage } from "next";
import { Heading, Text } from "@chakra-ui/react";
import Layout from "../ui/molecules/Layout";
import Seo from "../components/Seo";

const NotFoundPage: NextPage = () => (
  <Layout>
    <Seo
      title="404: Not found"
      description="Generated by create next app"
    />
    <Heading textAlign="center" as="h1">
      NOT FOUND
    </Heading>
    <Text textAlign="center">
      You just hit a route that doesn't exist... the sadness.
    </Text>
  </Layout>
);

export default NotFoundPage;
