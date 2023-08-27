import { json, redirect } from "@remix-run/node";
import { useLoaderData, useNavigate, useSubmit } from "@remix-run/react";
import { SearchMinor, MetafieldsMinor, DiscountsFilledMinor, MagicMinor, StoreDetailsMinor } from '@shopify/polaris-icons';
import { ActionList, Button, IndexTable, LegacyCard, Page, Popover, Text } from "@shopify/polaris";
import indexStyles from "./_index/style.css";
import { useEffect, useState } from "react";
import StoreServer from "~/server/store.server";
import { authenticated, logout, requireUserId } from "~/server/auth.server";
import { gql, useQuery } from "@apollo/client";

export const links = () => [{ rel: "stylesheet", href: indexStyles }];

export async function loader({ request }) {
    return null;
}

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

const GET_ALL_STORES = gql`
  query GetAllStores {
    getAllStores {
      id
      name
      email
      country
      myshopify_domain
    }
  }
`;

export default function Admin() {
    const submit = useSubmit();
    // const { merchants } = useLoaderData();
    const navigate = useNavigate();
    const [selectedMerchantId, setSelectedMerchantId] = useState(null);
    const handlePopoverOpen = (merchantId) => {
        setSelectedMerchantId(merchantId);
    }

    const { loading, error, data } = useQuery(GET_ALL_STORES); 
    console.log(error);
    
    useEffect(() => {
        if(error?.message === 'Not authenticated' || error?.message === 'invalid token') {
            console.log(3333);
            navigate('/');
        }
    }, [error])

    if(data) {
        console.log('NGUYEN HONG SON: ', data?.getAllStores);
    }
    
    const handlePopoverClose = () => {
        setSelectedMerchantId(null);
    }
    
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
    } else {
        rowMarkup = (
            <IndexTable.Row
                id={"Loading"}
                position={1}
            >
                Loading
            </IndexTable.Row>
        );
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