import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { MagicMinor, ResetMinor } from "@shopify/polaris-icons";
import {
  Pagination,
  Box,
  Button,
  Card,
  Frame,
  IndexTable,
  Layout,
  LegacyCard,
  Link,
  List,
  Page,
  Spinner,
  Text,
  Thumbnail,
  VerticalStack,
  Toast,
  Loading,
} from "@shopify/polaris";
import { authenticate } from "~/shopify.server";
import { useOptimize } from "../hooks/useOptimize";

export async function loader({ request }) {
  const { session } = await authenticate.admin(request);
  return json({
    accessToken: session.accessToken,
  });
}

export default function ProductsPage() {
  const { accessToken } = useLoaderData();
  const {
    optimizing,
    loading,
    error,
    data,
    toast,
    setToast,
    dataParsed,
    handleOptimize,
    pageInfo,
    handlePrevious,
    handleNext,
  } = useOptimize({
    accessToken,
  });

  const resourceName = {
    singular: "product",
    plural: "products",
  };
  let rowMarkup;
  if (dataParsed && dataParsed?.files?.nodes) {
    console.log("dataParsed.files.edges", dataParsed);
    rowMarkup = dataParsed.files.nodes.map((file, index) => {
      if (file.image) {
        let fileName = file.image.originalSrc.split("?")[0] || "";
        if (fileName) {
          fileName = fileName.split("/");
          if (fileName.length) fileName = fileName[fileName.length - 1];
        }
        return (
          <IndexTable.Row id={file.id} key={file.id} position={index}>
            <IndexTable.Cell>
              <Button
                icon={MagicMinor}
                size="micro"
                disabled={optimizing}
                onClick={() => {
                  handleOptimize(file);
                }}
              >
                Optimize
              </Button>
            </IndexTable.Cell>
            <IndexTable.Cell>
              <Thumbnail
                source={file.image.originalSrc}
                size="small"
                alt={file.id}
              />
            </IndexTable.Cell>
            <IndexTable.Cell>{fileName}</IndexTable.Cell>
            <IndexTable.Cell>{file.alt || file.id}</IndexTable.Cell>
            <IndexTable.Cell>
              {file?.originalSource?.fileSize
                ? `${Math.round(file.originalSource.fileSize / 10) / 100} KB`
                : ""}
            </IndexTable.Cell>
          </IndexTable.Row>
        );
      }
      return "";
    });
  } else if (loading) {
    rowMarkup = (
      <p style={{ textAlign: "center" }}>
        <Spinner />
      </p>
    );
  } else if (error) {
    rowMarkup = "";
  }

  return (
    <Frame>
      {optimizing && <Loading />}
      <Page
        title="Optimize Images"
        secondaryActions={[{ content: "Restore All", onAction: () => {} }]}
        primaryAction={{
          content: "Bulk Optimize (10 at max)",
          onAction: () => {},
        }}
      >
        <LegacyCard>
          <IndexTable
            resourceName={resourceName}
            itemCount={1}
            headings={[
              { title: "Action" },
              { title: "Preview" },
              { title: "File name" },
              { title: "Alt" },
              { title: "Size" },
              { title: "Action" },
            ]}
            selectable={false}
          >
            {rowMarkup}
          </IndexTable>
          {!!pageInfo && (
            <div
              style={{
                padding: "1rem",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Pagination
                hasPrevious={pageInfo && pageInfo?.hasPreviousPage}
                onPrevious={handlePrevious}
                hasNext={pageInfo && pageInfo?.hasNextPage}
                onNext={handleNext}
              />
            </div>
          )}
        </LegacyCard>
      </Page>
      {!!toast ? (
        <Toast
          content={toast}
          onDismiss={() => {
            setToast("");
          }}
        />
      ) : null}
    </Frame>
  );
}
