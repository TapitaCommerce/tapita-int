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
import { MagicMajor } from "@shopify/polaris-icons";
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
import OpenAI from "openai";
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
}

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
  const [textSuggestContent, setTextFieldValue2] = useState("");

  const handleTitleChange = useCallback(
    (value) => setTextFieldValue1(value),
    []
  );
  const handleDescriptionChange = useCallback(
    (value) => setTextFieldValue(value),
    []
  );

  const handleSuggest = async () => {
    if (textDescriptionValue) {
      const openai = new OpenAI({
        apiKey: "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",
        // organization: "POVLMRK51304",
        dangerouslyAllowBrowser: true,
      });

      try {
        const completion = await openai.completions.create({
          model: "text-davinci-003",
          prompt: textDescriptionValue,
          max_tokens: 100,
          temperature: 0.7,
        });

        setTextFieldValue2(completion.choices[0].text);
      } catch (error) {
        console.error("Error suggesting content:", error);
      }
    }
  };

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
              <TextField
                label="Suggest Content"
                value={textSuggestContent}
                onChange={(value) => setTextFieldValue2(value)}
                autoComplete="off"
                multiline
              />
            </FormLayout>
          </LegacyCard>
        </Layout.Section>
      </Layout>
      <PageActions
        secondaryActions={[
          {
            content: "Suggest",
            onAction: handleSuggest,
          },
        ]}
        primaryAction={{
          content: "Save",
          onAction: handleSave,
        }}
      />
    </Page>
  );
}
