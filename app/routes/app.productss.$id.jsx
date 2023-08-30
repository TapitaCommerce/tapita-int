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
  const { session } = await authenticate.admin(request);
  const config = {
    headers: {
      "X-Shopify-Access-Token": session.accessToken,
      "Accept-Encoding": "application/json",
    },
  };

  const productsResponse = await axios.get(
    `https://${session.shop}/admin/api/2023-07/products/${params.id}.json`,
    config
  );
  const productEdit = {
    id: productsResponse.data.product.id,
    title: productsResponse.data.product.title,
    description: productsResponse.data.product.body_html,
  };
  return json({ productEdit: productEdit });
}
export async function action({ request }) {
  const { session } = await authenticate.admin(request);
  const { shop } = session;
  if (request.method === "POST") {
    const formData = Object.fromEntries(await request.formData());
    console.log(formData);
    const data = {
      product: {
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
      `https://${shop}/admin/api/2023-07/products/${formData.id}.json`,
      data,
      config
    );

    console.log(formData);

    return redirect(`/app/products`);
  }
  return null;
}
// //Tạo API của Open API

// import OpenAI from "openai";
// const openai = new OpenAI({
//   apiKey: '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' ,
//   organization: "org-How50XcyMrGqOrdoVJUBbwGC"
// });

// const completion = await openai.completions.create({
//   model: "text-davinci-003",
//   prompt: "This story begins",
//   max_tokens: 30,
// });
// console.log(completion.choices[0].text);

//   console.log(completion);
// }

// //....
export default function PageChange() {
  const { productEdit } = useLoaderData();
  const navigate = useNavigate();

  const [formState, setFormState] = useState(productEdit);
  const [cleanFormState, setCleanFormState] = useState(productEdit);

  const [textTitleValue, setTextFieldValue1] = useState(
    productEdit.title || ""
  );
  const [textDescriptionValue, setTextFieldValue] = useState(
    productEdit.description || ""
  );

  const handleTitleChange = useCallback(
    (value) => setTextFieldValue1(value),
    []
  );
  const handleDescriptionChange = useCallback(
    (value) => setTextFieldValue(value),
    []
  );

  const submit = useSubmit();

  function handleSave() {
    const data = {
      id: productEdit.id,
      title: textTitleValue,
      description: textDescriptionValue,
    };
    setCleanFormState({ ...formState });
    submit(data, { method: "post" });
  }
  return (
    <Page
      backAction={{
        content: "Back to Products",
        onAction: () => navigate("/app/products"),
      }}
      title={`Edit Page: ${productEdit.title}`}
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
        }}
      />
    </Page>
  );
}
