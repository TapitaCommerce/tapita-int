import { Button, IndexTable, LegacyCard, Page, Spinner, Text } from "@shopify/polaris";
import indexStyles from "./_index/style.css";
import { useNavigate } from "@remix-run/react";
import { useQuery } from "@apollo/client";
import { GET_PRODUCTS_BY_STORE } from "~/graphql/query";
import { truncate } from "~/utils";
export const links = () => [{ rel: "stylesheet", href: indexStyles }];

export default function StoreProducts() {
    const navigate = useNavigate();

    const resourceName = {
        singular: 'product',
        plural: 'products',
    };

    const { loading, error, data } = useQuery(GET_PRODUCTS_BY_STORE);
    console.log(data);

    let rowMarkup;

    if(data) {
        rowMarkup = data?.getProductsByStore.map(
            ( product, index ) => (
              <IndexTable.Row
                id={product.id}
                key={product.id}
                position={index}
              >
                <IndexTable.Cell>
                    <Text variant="bodyMd" fontWeight="bold" as="span">
                        {product.id}
                    </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>{truncate(product.title)}</IndexTable.Cell>
                <IndexTable.Cell>{product.body_html ? truncate(product.body_html) : ""}</IndexTable.Cell>
              </IndexTable.Row>
            ),
        );
    } else if (loading) {
        rowMarkup = (
            <p style={{textAlign: 'center'}}><Spinner /></p>
        );
    } else if (error) {
        rowMarkup = (
            <p style={{textAlign: 'center'}}>{error.message}</p>
        )
    }

    return (
        <Page 
            title="Store Products"
            primaryAction={
                <Button
                    primary
                    onClick={() => console.log('In progress ...')}
                >
                    Create new product
                </Button>
            }
        >
            <LegacyCard>
                <IndexTable
                    resourceName={resourceName}
                    itemCount={1}
                    headings={[
                        {title: 'ID'},
                        {title: 'Title'},
                        {title: 'Description'},
                    ]}
                    selectable={false}
                >
                    {rowMarkup}
                </IndexTable>
            </LegacyCard>
        </Page>
    )
}