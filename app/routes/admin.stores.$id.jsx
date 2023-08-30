import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Bleed, Button, Card, Divider, HorizontalStack, Layout, Page, PageActions, Spinner, Text, TextField, VerticalStack } from "@shopify/polaris";
import indexStyles from "./_index/style.css";
import { useQuery } from "@apollo/client";
import { GET_STORE } from "~/graphql/query";

export const links = () => [{ rel: "stylesheet", href: indexStyles }];

export async function loader({ request, params }) {
    return json({ id: params.id });
}

export default function AdminStoreDetail() {
    const { id } = useLoaderData();
    const { loading, error, data } = useQuery(GET_STORE, {
        variables: {
            input: {
                id: id
            }
        }
    });
    
    let StoreInformation;

    if(data?.getStore) {
        StoreInformation = (
            <>
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
            </>
        )
    } else {
        StoreInformation = <p style={{ textAlign: 'center' }}><Spinner /></p>
    }

    return (
        <Page title="Admin Store Detail">
            {
                error ? <p>{error.message}</p> : null
            }
            <Layout>
                <Layout.Section>
                    <VerticalStack gap="5">
                        <Card>
                            <VerticalStack gap="5">
                                <Text as={"h2"} variant="headingLg">
                                    Store Information
                                </Text>
                                {StoreInformation}
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
                                {
                                    data?.getStore ? (
                                        <TextField
                                            label="Store access token"
                                            value={data?.getStore.accessToken}
                                            type="password"
                                            autoComplete="text"
                                        />
                                    ) : (
                                        <p style={{ textAlign: 'center' }}><Spinner /></p>
                                    )
                                }
                                
                            </VerticalStack>
                        </Card>
                    </VerticalStack>
                </Layout.Section>
                <Layout.Section>
                    <PageActions 
                        secondaryActions={[
                            {
                                content: "Delete",
                            },
                        ]}
                        primaryAction={{
                            content: "Save",
                        }}
                    />
                </Layout.Section>
            </Layout>
        </Page>
    )
}