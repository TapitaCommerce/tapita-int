import { json } from "@remix-run/node";
import { useLoaderData, useNavigate, useSubmit } from "@remix-run/react";
import { Bleed, Button, Card, ChoiceList, Divider, HorizontalStack, Layout, Page, PageActions, Text, TextField, VerticalStack } from "@shopify/polaris";
import CustomPolarisAppProvider from "~/components/CustomPolarisAppProvider";
import DefaultLayout from "~/components/layout/DefaultLayout";
import { logout, requireUserId } from "~/server/auth.server";
import StoreServer from "~/server/store.server";
import { handleLogout } from "~/utils/auth.util";
import indexStyles from "./_index/style.css";
import { useEffect, useState } from "react";
import { gql, useQuery } from "@apollo/client";

export const links = () => [{ rel: "stylesheet", href: indexStyles }];

export async function loader({ request, params }) {
    // await requireUserId(request, '/');

    // const merchantId = params.id;
    // const store = await StoreServer.getStore({
    //     store_id: merchantId,
    // });
    return json({ id: params.id });
}

const GET_STORE = gql`
query GetStore($input: GetStoreInput) {
  getStore(input: $input) {
    id
    name
    email
    shop
    domain
    scope
    country
    customer_email
    myshopify_domain
    plan_name
    plan_display_name
    shop_owner
    iana_timezone
    currency
    address1
    address2
    phone
    created_at
    accessToken
  }
}
`;

export default function AdminStoreDetail() {
    const { id } = useLoaderData();

    const navigate = useNavigate();
    const [selectedMerchantId, setSelectedMerchantId] = useState(null);
    const handlePopoverOpen = (merchantId) => {
        setSelectedMerchantId(merchantId);
    }

    const { loading, error, data } = useQuery(GET_STORE, {
        variables: {
            input: {
                id: id
            }
        }
    }); 
    // console.log(error);
    console.log(data);
    useEffect(() => {
        if(error?.message === 'Not authenticated' || error?.message === 'invalid token') {
            console.log(3333);
            navigate('/');
        }
    }, [error])

    if(data) {
        console.log('NGUYEN HONG SON: ', data?.getStore);
    }

    return (
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
                                    value={data?.getStore.id}
                                    type="text"
                                    autoComplete="text"
                                />

                                <TextField
                                    label="Store name"
                                    value={data?.getStore.name}
                                    type="text"
                                    autoComplete="text"
                                />

                                <TextField
                                    label="Store email"
                                    value={data?.getStore.email}
                                    type="email"
                                    autoComplete="email"
                                />

                                <TextField
                                    label="Store domain"
                                    value={data?.getStore.domain}
                                    type="text"
                                    autoComplete="text"
                                />

                                <TextField
                                    label="Store scope"
                                    value={data?.getStore.domain}
                                    type="text"
                                    autoComplete="text"
                                />

                                <TextField
                                    label="Store country"
                                    value={data?.getStore.domain}
                                    type="text"
                                    autoComplete="text"
                                />

                                <TextField
                                    label="Store customer email"
                                    value={data?.getStore.domain}
                                    type="text"
                                    autoComplete="text"
                                />

                                <TextField
                                    label="Shopify domain"
                                    value={data?.getStore.myshopify_domain}
                                    type="text"
                                    autoComplete="text"
                                />

                                <TextField
                                    label="App plan name"
                                    value={data?.getStore.plan_name}
                                    type="text"
                                    autoComplete="text"
                                />

                                <TextField
                                    label="App plan display name"
                                    value={data?.getStore.plan_display_name}
                                    type="text"
                                    autoComplete="text"
                                />

                                <TextField
                                    label="Store owner"
                                    value={data?.getStore.shop_owner}
                                    type="text"
                                    autoComplete="text"
                                />

                                <TextField
                                    label="Store iana timezone"
                                    value={data?.getStore.iana_timezone}
                                    type="text"
                                    autoComplete="text"
                                />

                                <TextField
                                    label="Store currency"
                                    value={data?.getStore.currency}
                                    type="text"
                                    autoComplete="text"
                                />

                                <TextField
                                    label="Store address1"
                                    value={data?.getStore.address1}
                                    type="text"
                                    autoComplete="text"
                                />

                                <TextField
                                    label="Store address2"
                                    value={data?.getStore.address2}
                                    type="text"
                                    autoComplete="text"
                                />

                                <TextField
                                    label="Store phone"
                                    value={data?.getStore.phone}
                                    type="text"
                                    autoComplete="text"
                                />

                                <TextField
                                    label="Store created at"
                                    value={data?.getStore.created_at}
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
                                    value={data?.getStore.accessToken}
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
    )
}