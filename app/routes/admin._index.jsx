import { useNavigate } from "@remix-run/react";
import { SearchMinor, MetafieldsMinor, DiscountsFilledMinor, MagicMinor, StoreDetailsMinor } from '@shopify/polaris-icons';
import { ActionList, Button, IndexTable, LegacyCard, Page, Popover, Spinner, Text } from "@shopify/polaris";
import indexStyles from "./_index/style.css";
import { useState } from "react";
import { logout, requireUserId } from "~/server/auth.server";
import { useQuery } from "@apollo/client";
import { GET_ALL_STORES } from "~/graphql/query";

export const links = () => [{ rel: "stylesheet", href: indexStyles }];

export async function action({ request }) {
    if(request.method === "POST") {
        const data = {
            ...Object.fromEntries(await request.formData()),
        };
        if(data._action === 'logout') {
            return logout(request);
        }
    }
    return null;
}

export default function Admin() {
    const navigate = useNavigate();
    const [selectedMerchantId, setSelectedMerchantId] = useState(null);

    const handlePopoverOpen = (merchantId) => {
        setSelectedMerchantId(merchantId);
    }

    const handlePopoverClose = () => {
        setSelectedMerchantId(null);
    }

    const { loading, error, data } = useQuery(GET_ALL_STORES);
    
    const resourceName = {
        singular: 'merchant',
        plural: 'merchants',
    };

    let rowMarkup;

    if(data) {
        rowMarkup = data?.getAllStores.map(
            ( merchant, index ) => (
              <IndexTable.Row
                id={merchant.id}
                key={merchant.id}
                position={index}
              >
                <IndexTable.Cell>
                    <Text variant="bodyMd" fontWeight="bold" as="span">
                        {merchant.name}
                    </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>{merchant.country}</IndexTable.Cell>
                <IndexTable.Cell>{merchant.email}</IndexTable.Cell>
                <IndexTable.Cell>{merchant.myshopify_domain}</IndexTable.Cell>
                <IndexTable.Cell>
                    <Popover
                        active={selectedMerchantId === merchant.id}
                        activator={
                            <Button onClick={() => handlePopoverOpen(merchant.id)}>
                                Actions
                            </Button>
                        }
                        autofocusTarget="first-node"
                        onClose={handlePopoverClose}
                    >
                        <ActionList
                            sections={[
                                {
                                    title: 'Action options',
                                    items: [
                                        {
                                            content: 'Detail',
                                            icon: StoreDetailsMinor,
                                            onAction: () => navigate(`/admin/stores/${merchant.id}`)
                                        },
                                        {
                                            content: 'Search',
                                            icon: SearchMinor,
                                            onAction: () => {
                                                console.log('Search action');
                                            }
                                        },
                                        {
                                            content: 'Metadata', 
                                            icon: MetafieldsMinor,
                                            onAction: () => {
                                                console.log('Metadata action');
                                            }
                                        },
                                        {
                                            content: 'Page Speed',
                                            icon: DiscountsFilledMinor,
                                            onAction: () => {
                                                console.log('Page Speed Action');
                                            }
                                        },
                                        {
                                            content: 'Instant Page',
                                            icon: MagicMinor,
                                            onAction: () => {
                                                console.log("Instant Page Action");
                                            }
                                        },
                                    ],
                                },
                            ]}
                        />
                    </Popover>
                </IndexTable.Cell>
              </IndexTable.Row>
            ),
          );
    } else if (loading) {
        rowMarkup = (
            <Spinner />
        );
    } else if (error) {
        rowMarkup = (
            <p>{error.message}</p>
        )
    }
    

    return (
        <Page title="Merchants List">
            <LegacyCard>
                <IndexTable
                    resourceName={resourceName}
                    itemCount={data?.getAllStores.length || 0}
                    headings={[
                        {title: 'Name'},
                        {title: 'Country'},
                        {title: 'Email'},
                        {title: 'Shopify Domain'},
                        {title: 'Actions'},
                    ]}
                    selectable={false}
                >
                    {rowMarkup}
                </IndexTable>
            </LegacyCard>
        </Page>
    )
}