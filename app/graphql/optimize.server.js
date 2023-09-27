import StoreModel from "~/models/store.model";
import axios from "axios";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const optimize = async (args, request) => {
    let result = false;
    console.log('optimize args', args);
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
        if (args.toRestore) {
            //reverse optimized images

        } else if (args.id) {
            //const updateFileQuery = getUpdateFileQuery()
            const loadFileByIdQuery = getLoadFileQuery(args.id)
            const responseGraphqlAPI = await axios.post(
                url,
                loadFileByIdQuery,
                configGraphql
            );
            if (!responseGraphqlAPI || responseGraphqlAPI?.data?.errors)
                return false;
            if (responseGraphqlAPI && responseGraphqlAPI?.data?.data?.node?.image) {
                const imageNode = responseGraphqlAPI.data.data.node
                /* 
                const imageContent = await axios({
                    url: imageNode.image.originalSrc,
                    method: 'GET',
                    responseType: 'blob',
                });
                console.log('imageContent', imageContent?.data?.length);
                */
                await sleep(600);
                console.log('imageData', responseGraphqlAPI.data.data.node);
                let sourceFileName = imageNode.image.originalSrc.split('/');
                if (sourceFileName && sourceFileName.length) {
                    sourceFileName = sourceFileName[sourceFileName.length - 1]
                    sourceFileName = sourceFileName.split('?');
                    sourceFileName = sourceFileName[0];
                    console.log('sourceFileName', sourceFileName);
                    const sourceURL = imageNode.image.url.split('?')[0];
                    const fileCreateQuery = getFileCreateQuery(imageNode.alt || sourceFileName, sourceFileName, sourceURL);
                    const responseCreatingFile = await axios.post(
                        url,
                        fileCreateQuery,
                        configGraphql
                    );
                    console.log('responseCreatingFileERR', responseCreatingFile?.data?.errors)
                    console.log('responseCreatingFile', responseCreatingFile?.data?.data)
                    await sleep(1000);
                    
                    return JSON.stringify(responseCreatingFile?.data?.data);
                } else {
                    return false;
                }
            }
        }
        result = false;
    } else {
        throw new Error("Fail to authenticate to merchant store");
    }
    return result;
}
const getLoadFileQuery = (id) => {
    return {
        query: `query {
            node(id: "${id}") {
                id
                ... on MediaImage {
                    createdAt
                    updatedAt
                    alt
                    originalSource {
                        fileSize
                    }
                    image {
                        id
                        url
                        originalSrc
                        width
                        height
                    }
                }
            }
          }`
    };
}
const getUpdateFileQuery = () => {
    return {
        query: `mutation fileUpdate($files: [FileUpdateInput!]!) {
            fileUpdate(files: $files) {
              files {
                id
                ... on MediaImage {
                    createdAt
                    updatedAt
                    alt
                    originalSource {
                        fileSize
                    }
                    image {
                        id
                        originalSrc
                        width
                        height
                    }
                }
              }
              userErrors {
                field
                message
              }
            }
        }`
    };
}

const getFileCreateQuery = (alt, filename, originalSource) => {
    const files = [{
        alt,
        contentType: 'IMAGE',
        filename,
        originalSource,
        duplicateResolutionMode: 'APPEND_UUID'
    }];
    console.log('files', files)
    return {
        query: `mutation fileCreate($files: [FileCreateInput!]!) {
            fileCreate(files: $files) {
              files {
                id
                ... on MediaImage {
                    createdAt
                    updatedAt
                    alt
                    originalSource {
                        fileSize
                    }
                    image {
                        id
                        originalSrc
                        width
                        height
                    }
                }
              }
              userErrors {
                field
                message
              }
            }
          }`,
        variables: {
            files
        }
    }
}