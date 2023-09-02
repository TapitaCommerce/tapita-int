import { useQuery } from "@apollo/client";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Box,
  Card,
  IndexTable,
  Layout,
  LegacyCard,
  Link,
  List,
  Page,
  Spinner,
  Text,
  VerticalStack,
} from "@shopify/polaris";
import { MERCHANT_ACCESS_TOKEN } from "~/constants/header.constant";
import { GET_PRODUCTS_BY_STORE } from "~/graphql/query";
import { authenticate } from "~/shopify.server";
import { truncate } from "~/utils";

export async function loader({ request }) {
  const { session } = await authenticate.admin(request);
  return json({
    accessToken: session.accessToken,
  })
}

export default function ProductsPage() {
  const { accessToken } = useLoaderData();
  
  const { loading, error, data } = useQuery(GET_PRODUCTS_BY_STORE, {
    variables: {
        input: {
            merchantAccessToken: accessToken
        }
    }
  });

  const resourceName = {
    singular: 'product',
    plural: 'products',
  };

  let rowMarkup;

    if(data) {
        rowMarkup = data?.getProductsByStore.map(
            ( product, index ) => (
              <IndexTable.Row
                id={product.id}
                key={product.id}
                position={index}
              >
                <IndexTable.Cell>
                    <Text variant="bodyMd" fontWeight="bold" as="span">
                        {product.id}
                    </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>{truncate(product.title)}</IndexTable.Cell>
                <IndexTable.Cell>{product.body_html ? truncate(product.body_html) : ""}</IndexTable.Cell>
              </IndexTable.Row>
            ),
        );
  } else if (loading) {
      rowMarkup = (
          <p style={{textAlign: 'center'}}><Spinner /></p>
      );
  } else if (error) {
      rowMarkup = (
          <p style={{textAlign: 'center'}}>{error.message}</p>
      )
  }

  return (
    <Page>
      <ui-title-bar title="Products" />
      <LegacyCard>
          <IndexTable
              resourceName={resourceName}
              itemCount={1}
              headings={[
                  {title: 'ID'},
                  {title: 'Title'},
                  {title: 'Description'},
              ]}
              selectable={false}
          >
              {rowMarkup}
          </IndexTable>
      </LegacyCard>
    </Page>
  );
}

function Code({ children }) {
  return (
    <Box
      as="span"
      padding="025"
      paddingInlineStart="1"
      paddingInlineEnd="1"
      background="bg-subdued"
      borderWidth="1"
      borderColor="border"
      borderRadius="1"
    >
      <code>{children}</code>
    </Box>
  );
}
