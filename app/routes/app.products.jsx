import Shopify, { ApiVersion } from "@shopify/shopify-api";
import { json, redirect } from "@remix-run/node";
import {
  IndexTable,
  LegacyCard,
  useIndexResourceState,
  Text,
  Badge,
  Page,
  Thumbnail,
  Button,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";

import React from "react";
import axios from "axios";
import { useLoaderData, Link, useNavigate } from "@remix-run/react";

export async function loader({ request }) {
  const { session } = await authenticate.admin(request);
  const config = {
    headers: {
      "X-Shopify-Access-Token": session.accessToken,
      "Accept-Encoding": "application/json",
    },
  };
  const productsResponse = await axios.get(
    `https://${session.shop}/admin/api/2023-07/products.json`,
    config
  );
  const productList = productsResponse.data.products.map((product) => ({
    id: product.id,
    title: product.title,
    description: product.body_html || "",
    date: product.published_at,
  }));
  return json({ productList: productList });
}
export async function action({ request }) {
  const { session } = await authenticate.admin(request);
  const { shop } = session;

  /** @type {any} */
  const data = {
    ...Object.fromEntries(await request.formData()),
    shop,
  };
  const errors = validatePage(data);

  if (errors) {
    return json({ errors }, { status: 422 });
  }
}

export default function ProductForm() {
  const { productList } = useLoaderData(); //chú ý không push thẳng vào page form
  const navigate = useNavigate();
  const resourceName = {
    singular: "order",
    plural: "orders",
  };
  function truncate(str) {
    const n = 25;
    return str.length > n ? str.substr(0, n - 1) + "…" : str;
  }
  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(productList);
  const rowMarkup = productList.map(
    ({ id, date, title, description }, index) => {
      return (
        <IndexTable.Row id={id} key={id} position={index}>
          <IndexTable.Cell>
            <Text variant="bodyMd" fontWeight="bold" as="span">
              {id}
            </Text>
          </IndexTable.Cell>
          <IndexTable.Cell>{truncate(title)}</IndexTable.Cell>
          <IndexTable.Cell>{truncate(description)}</IndexTable.Cell>
          <IndexTable.Cell>{date}</IndexTable.Cell>
          <IndexTable.Cell>
            <Button primary onClick={() => navigate(`/app/productss/${id}`)}>
              Edit
            </Button>
          </IndexTable.Cell>
        </IndexTable.Row>
      );
    }
  );

  return (
    <Page>
      <ui-title-bar title="Product"></ui-title-bar>
      <LegacyCard>
        <IndexTable
          resourceName={resourceName}
          itemCount={productList.length}
          headings={[
            { title: "Id" },
            { title: "Title" },
            { title: "Description" },
            { title: "Date" },
          ]}
          selectable={false}
        >
          {rowMarkup}
        </IndexTable>
      </LegacyCard>
    </Page>
  );
}
export function validatePage(data) {
  const errors = {};

  if (!data.title) {
    errors.title = "Title is required";
  }

  if (!data.destination) {
    errors.destination = "Destination is required";
  }

  if (Object.keys(errors).length) {
    return errors;
  }
}
