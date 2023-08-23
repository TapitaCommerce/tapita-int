import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Bleed, Button, Card, ChoiceList, Divider, HorizontalStack, Layout, Page, PageActions, Text, TextField, VerticalStack } from "@shopify/polaris";
import CustomPolarisAppProvider from "~/components/CustomPolarisAppProvider";
import StoreServer from "~/server/store.server";

export async function loader({ request, params }) {
    const merchantId = params.id;
    const store = await StoreServer.getStore({
        store_id: merchantId,
    });
    return json({ store });
}

export async function action({ request, params }) {

}

export default function AdminStoreDetail() {
    const { store } = useLoaderData();
    return (
        <CustomPolarisAppProvider>
            <Page title="Admin Store Detail">
                <Layout>
                    <Layout.Section>
                        <VerticalStack gap="5">
                            <Card>
                                <VerticalStack gap="5">
                                    <Text as={"h2"} variant="headingLg">
                                        Store Information
                                    </Text>
                                    <TextField
                                        label="Store id"
                                        value={store.id}
                                        type="text"
                                        autoComplete="text"
                                    />

                                    <TextField
                                        label="Store name"
                                        value={store.name}
                                        type="text"
                                        autoComplete="text"
                                    />

                                    <TextField
                                        label="Store email"
                                        value={store.email}
                                        type="email"
                                        autoComplete="email"
                                    />

                                    <TextField
                                        label="Store domain"
                                        value={store.domain}
                                        type="text"
                                        autoComplete="text"
                                    />

                                    <TextField
                                        label="Store scope"
                                        value={store.domain}
                                        type="text"
                                        autoComplete="text"
                                    />

                                    <TextField
                                        label="Store country"
                                        value={store.domain}
                                        type="text"
                                        autoComplete="text"
                                    />

                                    <TextField
                                        label="Store customer email"
                                        value={store.domain}
                                        type="text"
                                        autoComplete="text"
                                    />

                                    <TextField
                                        label="Shopify domain"
                                        value={store.myshopify_domain}
                                        type="text"
                                        autoComplete="text"
                                    />

                                    <TextField
                                        label="App plan name"
                                        value={store.plan_name}
                                        type="text"
                                        autoComplete="text"
                                    />

                                    <TextField
                                        label="App plan display name"
                                        value={store.plan_display_name}
                                        type="text"
                                        autoComplete="text"
                                    />

                                    <TextField
                                        label="Store owner"
                                        value={store.shop_owner}
                                        type="text"
                                        autoComplete="text"
                                    />

                                    <TextField
                                        label="Store iana timezone"
                                        value={store.iana_timezone}
                                        type="text"
                                        autoComplete="text"
                                    />

                                    <TextField
                                        label="Store currency"
                                        value={store.currency}
                                        type="text"
                                        autoComplete="text"
                                    />

                                    <TextField
                                        label="Store address1"
                                        value={store.address1}
                                        type="text"
                                        autoComplete="text"
                                    />

                                    <TextField
                                        label="Store address2"
                                        value={store.address2}
                                        type="text"
                                        autoComplete="text"
                                    />

                                    <TextField
                                        label="Store phone"
                                        value={store.phone}
                                        type="text"
                                        autoComplete="text"
                                    />

                                    <TextField
                                        label="Store created at"
                                        value={store.created_at}
                                        type="text"
                                        autoComplete="text"
                                    />
                                </VerticalStack>
                            </Card>
                        </VerticalStack>
                    </Layout.Section>
                    <Layout.Section secondary> 
                        <VerticalStack gap={"5"}>
                            <Card>
                                <VerticalStack gap={"5"}>
                                    <HorizontalStack align="space-between">
                                        <Text as="h2" variant="headingLg"> 
                                            Action
                                        </Text>
                                    </HorizontalStack>
                                    <Bleed marginInline="20">
                                        <Divider />
                                    </Bleed>
                                    <Button
                                        primary
                                    >
                                        Search
                                    </Button>
                                    <Button
                                        primary
                                    >
                                        Metadata
                                    </Button>
                                    <Button
                                        primary
                                    >
                                        Page Speed
                                    </Button>
                                    <Button
                                        primary
                                    >
                                        Instant Page
                                    </Button>
                                </VerticalStack>
                            </Card>
                            <Card>
                            <VerticalStack gap={"5"}>
                                    <HorizontalStack align="space-between">
                                        <Text as="h2" variant="headingLg"> 
                                            Secret information
                                        </Text>
                                    </HorizontalStack>
                                    <Bleed marginInline="20">
                                        <Divider />
                                    </Bleed>
                                    <TextField
                                        label="Store access token"
                                        value={store.accessToken}
                                        type="password"
                                        autoComplete="text"
                                    />
                                </VerticalStack>
                            </Card>
                        </VerticalStack>
                    </Layout.Section>
                    <Layout.Section>
                        <PageActions 
                            secondaryActions={[
                                {
                                    content: "Delete",
                                    // loading: isDeleting,
                                    // disabled: !QRCode.id || !QRCode || isSaving || isDeleting,
                                    // destructive: true,
                                    // outline: true,
                                    // onAction: () => submit({}, { method: "delete" })
                                },
                            ]}
                            primaryAction={{
                                content: "Save",
                                // loading: isSaving,
                                // disabled: !isDirty || isSaving || isDeleting,
                                // onAction: handleSave,
                            }}
                        />
                    </Layout.Section>
                </Layout>
            </Page>
        </CustomPolarisAppProvider>
    )
}