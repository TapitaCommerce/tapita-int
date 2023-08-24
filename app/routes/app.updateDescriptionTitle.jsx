import {
  Page,
  Badge,
  LegacyCard,
  FormLayout,
  TextField,
  Icon,
  Layout,
  PageActions,
} from "@shopify/polaris";
import React from "react";

export default function PageExample() {
  return (
    <Page
      backAction={{ content: "Products", url: "#" }}
      title="Dog"
      //   titleMetadata={<Badge status="success">Active</Badge>}
      //   subtitle="Perfect pet"
      compactTitle
      pagination={{
        hasPrevious: true,
        hasNext: true,
      }}
    >
      <Layout>
        <Layout.Section>
          <LegacyCard sectioned>
            <FormLayout>
              <TextField label="Title" onChange={() => {}} autoComplete="off" />
              <TextField
                // type="email"
                label="Description"
                onChange={() => {}}
                autoComplete="email"
              />
            </FormLayout>
          </LegacyCard>
        </Layout.Section>
      </Layout>
      <PageActions
        primaryAction={{
          content: "Save",
        }}
      />
    </Page>
  );
}
