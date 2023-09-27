import { gql } from "@apollo/client";

/**
 * QUERY
 */
export const HELLO_QUERY = gql`
    query hello {
        hello
    }
`

export const GET_ALL_ADMINS = gql`
  query GetAllAdmins {
    getAllAdmins {
      id
      username
      password
      email
    }
  }
`;

export const GET_ALL_STORES = gql`
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

export const GET_STORE = gql`
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

export const GET_ADMIN = gql`
    query GetAdmin($input: GetAdminInput) {
        getAdmin(input: $input) {
            id
            username
            email
        }
    }
`;

export const GET_PRODUCTS_BY_STORE = gql`
  query GetProductsByStore($input: GetProductsByStoreInput) {
    getProductsByStore(input: $input) {
      id
      title
      body_html
      updated_at
    }
  }
`

export const SHOPIFY_QUERY = gql`
    query shopifyQuery($input: String, $merchantAccessToken: String) {
        shopifyQuery(input: $input, merchantAccessToken: $merchantAccessToken)
    }
`
export const OPTIMIZE_MUTATION = gql`
    mutation optimize($id: String, $toRestore: Boolean, $merchantAccessToken: String) {
        optimize(id: $id, toRestore: $toRestore,  merchantAccessToken: $merchantAccessToken)
    }
`