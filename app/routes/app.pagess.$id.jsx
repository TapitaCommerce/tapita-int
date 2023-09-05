import {
  Page,
  Badge,
  LegacyCard,
  FormLayout,
  TextField,
  Icon,
  Layout,
  PageActions,
  Button,
} from "@shopify/polaris";
import { MagicMinor } from "@shopify/polaris-icons";
import { TickSmallMinor } from "@shopify/polaris-icons";
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
        dangerouslyAllowBrowser: true,
      });

      try {
        const completion = await openai.completions.create({
          model: "text-davinci-003",
          prompt: textDescriptionValue,
          max_tokens: 500,
          temperature: 0.7,
        });

        setTextFieldValue2(completion.choices[0].text);
      } catch (error) {
        console.error("Error suggesting content:", error);
      }
    }
  };
  const handleMergeClick = () => {
    setTextFieldValue(textSuggestContent);
    setTextFieldValue2("");
  };

  const submit = useSubmit();
  function handleSave() {
    const data = {
      id: pageEdit.id,
      title: textTitleValue,
      description: textDescriptionValue,
    };
    setCleanFormState({ ...formState });
    submit(data, { method: "post" });
  }
  return (
    <Page
      backAction={{ content: "Products", url: "#" }}
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
              <TextField
                label="Suggest Content"
                value={textSuggestContent}
                onChange={(value) => setTextFieldValue2(value)}
                autoComplete="off"
                multiline
              />
              <Button
                size="micro"
                primary
                outline
                monochrome
                icon={TickSmallMinor}
                onClick={handleMergeClick}
              >
                Merge
              </Button>
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
