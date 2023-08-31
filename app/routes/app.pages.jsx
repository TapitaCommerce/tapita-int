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

import React, { useState } from "react";
import axios from "axios";
import { useLoaderData, useNavigate } from "@remix-run/react";

export async function loader({ request }) {
  const { session } = await authenticate.admin(request);
  const config = {
    headers: {
      "X-Shopify-Access-Token": session.accessToken,
      "Accept-Encoding": "application/json",
    },
  };
  const pagesResponse = await axios.get(
    `https://${session.shop}/admin/api/2023-07/pages.json`,
    config
  );
  const pageList = pagesResponse.data.pages.map((pages) => ({
    id: pages.id,
    title: pages.title,
    description: pages.body_html || "",
    // Image: product.image.src,
    date: pages.created_at,
  }));
  return json({ pageList: pageList });
}
export async function action({ request }) {
  const { session } = await authenticate.admin(request);
  const { shop } = session;

  /** @type {any} */
  const data = {
    ...Object.fromEntries(await request.formData()),
    shop,
  };
  // const navigate = useNavigate();

  const errors = validatePage(data);

  if (errors) {
    return json({ errors }, { status: 422 });
  }
}

export default function PageForm() {
  const { pageList } = useLoaderData(); //chú ý không push thẳng vào page form
  const navigate = useNavigate();

  function truncate(str) {
    const n = 25;
    return str.length > n ? str.substr(0, n - 1) + "…" : str;
  }
  const resourceName = {
    singular: "order",
    plural: "orders",
  };

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(pageList);

  const rowMarkup = pageList.map(
    ({ id, date, title, description, Image }, index) => (
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
          <Button primary onClick={() => navigate(`/app/pagess/${id}`)}>
            Edit
          </Button>
        </IndexTable.Cell>
      </IndexTable.Row>
    )
  );

  return (
    <Page>
      <ui-title-bar title="Page"></ui-title-bar>
      <LegacyCard>
        <IndexTable
          resourceName={resourceName}
          itemCount={pageList.length}
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
