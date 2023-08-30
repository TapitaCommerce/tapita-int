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
import React, { useState, useCallback } from "react";
import axios, { post } from "axios";
import {
  useActionData,
  useLoaderData,
  useNavigate,
  useSubmit,
} from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import { authenticate } from "~/shopify.server";

export async function loader({ request, params }) {
  console.log(params.id);
  const { session } = await authenticate.admin(request);
  const config = {
    headers: {
      "X-Shopify-Access-Token": session.accessToken,
      "Accept-Encoding": "application/json",
    },
  };

  const pagesResponse = await axios.get(
    `https://${session.shop}/admin/api/2023-07/pages/${params.id}.json`,
    config
  );
  const pageEdit = {
    id: pagesResponse.data.page.id,
    title: pagesResponse.data.page.title,
    description: pagesResponse.data.page.body_html,
  };
  return json({ pageEdit: pageEdit });
}
export async function action({ request }) {
  const { session } = await authenticate.admin(request);
  const { shop } = session;
  if (request.method === "POST") {
    const formData = Object.fromEntries(await request.formData());
    console.log(formData);
    const data = {
      page: {
        title: formData.title,
        body_html: formData.description,
      },
    };

    const config = {
      headers: {
        "X-Shopify-Access-Token": session.accessToken,
        "Accept-Encoding": "application/json",
      },
    };

    await axios.put(
      `https://${shop}/admin/api/2023-07/pages/${formData.id}.json`,
      data,
      config
    );

    console.log(formData);

    // return redirect(`/app/pagess/${formData.id}`);
    return redirect(`/app/pages`);
  }
  return null;
}

export default function PageChange() {
  const { pageEdit } = useLoaderData();
  const navigate = useNavigate();

  const [formState, setFormState] = useState(pageEdit);
  const [cleanFormState, setCleanFormState] = useState(pageEdit);

  const [textTitleValue, setTextFieldValue1] = useState(pageEdit.title || "");
  const [textDescriptionValue, setTextFieldValue] = useState(
    pageEdit.description || ""
  );

  const handleTitleChange = useCallback(
    (value) => setTextFieldValue1(value),
    []
  );
  const handleDescriptionChange = useCallback(
    (value) => setTextFieldValue(value),
    []
  );
  // const submit = useSubmit();

  // const handleSubmit = async () => {
  //   await action({
  //     request: {
  //       formData: async () => ({
  //         id: pageEdit.id,
  //         title: textTitleValue,
  //         description: textDescriptionValue,
  //       }),
  //     },
  //   });
  //   navigate(`/app/pagess/${pageEdit.id}`);
  // };
  const submit = useSubmit();

  function handleSave() {
    const data = {
      id: pageEdit.id,
      title: textTitleValue,
      description: textDescriptionValue,
    };
    console.log("Luu duong", data);
    setCleanFormState({ ...formState });
    submit(data, { method: "post" });
    // navigate(`/app/pages`);
  }
  return (
    <Page
      backAction={{
        content: "Back to Pages",
        onAction: () => navigate("/app/pages"),
      }}
      title={`Edit Page: ${pageEdit.title}`}
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
              <TextField
                label="Title"
                value={textTitleValue}
                onChange={handleTitleChange}
                placeholder="Example: Banh mi"
                autoComplete="off"
              />
              <TextField
                label="Description"
                value={textDescriptionValue}
                onChange={handleDescriptionChange}
                autoComplete="off"
                multiline={6}
              />
            </FormLayout>
          </LegacyCard>
        </Layout.Section>
      </Layout>
      <PageActions
        primaryAction={{
          content: "Save",
          onAction: handleSave,
          // url: `/app/pagess/${pageEdit.id}`,
        }}
      />
    </Page>
  );
}
