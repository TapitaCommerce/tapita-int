import { json, redirect } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { SearchMinor, MetafieldsMinor, DiscountsFilledMinor, MagicMinor, StoreDetailsMinor } from '@shopify/polaris-icons';
import { ActionList, Button, IndexTable, LegacyCard, Page, Popover, Text, useIndexResourceState } from "@shopify/polaris";
import CustomPolarisAppProvider from "~/components/CustomPolarisAppProvider";
import indexStyles from "./_index/style.css";
import { useCallback, useState } from "react";
import StoreServer from "~/server/store.server";
import { requireUserId } from "~/server/auth.server";

export const links = () => [{ rel: "stylesheet", href: indexStyles }];

export async function loader({ request }) {
    await requireUserId(request, '/');

    const merchants = await StoreServer.getAllStores({
        limit: 25,
        page: 1,
        filter: {}
    });

    return json(merchants);
}

export default function Admin() {
    const merchants = useLoaderData();
    const navigate = useNavigate();
    const [selectedMerchantId, setSelectedMerchantId] = useState(null);

    const handlePopoverOpen = (merchantId) => {
        setSelectedMerchantId(merchantId);
    }

    const handlePopoverClose = () => {
        setSelectedMerchantId(null);
    }

    const resourceName = {
        singular: 'merchant',
        plural: 'merchants',
    };

    const rowMarkup = merchants.map(
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
                                        onAction: () => navigate(`/stores/${merchant.id}`)
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

    return (
        <CustomPolarisAppProvider>
            <Page title="Merchants List">
                <LegacyCard>
                    <IndexTable
                        resourceName={resourceName}
                        itemCount={merchants.length}
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
        </CustomPolarisAppProvider>
    )
}