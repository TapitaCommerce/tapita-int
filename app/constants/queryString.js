export const shopInformation = `
    query {
    shop {
        id
        name
        email
        primaryDomain {
        host
        }
        myshopifyDomain
        plan {
        displayName
        }
        ianaTimezone
        currencyCode
        billingAddress {
        address1
        address2
        phone
        country
        }
    }
    }
`;
