import StoreModel from "~/models/store.model";
import axios from "axios";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const shopifyQuery = async (args, request) => {
    let result = {};
    console.log('inputinput', args)
    const merchantAccessToken = args.merchantAccessToken;
    if (merchantAccessToken) {
        const store = await StoreModel.findOne({
            accessToken: merchantAccessToken,
        });

        if (!store) {
            throw new Error(
                "Fail to authenticate to merchant store. Store not found"
            );
        }

        const url = `https://${store.myshopify_domain}/admin/api/2023-07/graphql.json`;
        const configGraphql = {
            headers: {
                "X-Shopify-Access-Token": store.accessToken,
            },
        };
        const input = args.input && JSON.parse(args.input) ? JSON.parse(args.input) : {}
        const number = input.number || 30;
        const afterPage = input.afterPage ? `after: "${input.afterPage}"` : '';
        const beforePage = input.beforePage ? `before: "${input.beforePage}"` : '';
        const first = beforePage ? `last: ${number}` : `first: ${number}`;
        const shopFilesData = {
            query: `{
                files(${first}, ${afterPage}, ${beforePage}, query: "media_type:image", reverse: true) {
                    nodes {
                        createdAt
                        updatedAt
                        alt
                        ... on GenericFile {
                            id
                            originalFileSize
                            url
                        }
                        ... on MediaImage {
                            id
                            originalSource {
                                fileSize
                            }
                            image {
                                id
                                originalSrc: url
                                width
                                height
                            }
                        }
                        ... on Video {
                            id
                            duration
                        }
                    }
                    pageInfo {
                        hasNextPage
                        hasPreviousPage
                        startCursor
                        endCursor
                    }
                }
            }`
        };
        const responseGraphqlAPI = await axios.post(
            url,
            shopFilesData,
            configGraphql
        );
        if (responseGraphqlAPI?.data?.errors)
            console.log('API ERROR: ', responseGraphqlAPI.data.errors);
        result = responseGraphqlAPI?.data?.data || responseGraphqlAPI?.data?.errors || null;
    } else {
        throw new Error("Fail to authenticate to merchant store");
    }
    return JSON.stringify(result);
};
export const shopifyMutation = async (args, request) => {
    return "BBB";
};
