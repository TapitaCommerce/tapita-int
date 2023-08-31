import {
    IndexTable,
    LegacyCard,
    useIndexResourceState,
    Text,
    Button,
    Page,
    Layout,
    TextField
} from '@shopify/polaris';
import Compressor from 'compressorjs';
import { useEffect, useState } from "react";
import { useActionData, useLoaderData, useSubmit } from '@remix-run/react';
import { authenticate } from '~/shopify.server';
import { json } from '@remix-run/node';
import axios from 'axios';
import Optimize from './services/Optimize';
export async function loader({ request }) {
    const { session } = await authenticate.admin(request);
    const { admin } = await authenticate.admin(request);
    const imageQuery =
        `query {
            files(first: 100) {
              edges {
                node {
                    createdAt
                  ... on MediaImage {
                    id
                    originalSource{
                        fileSize
                    }
                    image {
                      id
                      originalSrc: url
                      width
                      height
                    }
                  }
                }
              }
            }
          }       
          `
    const config = {
        headers: {
            "X-Shopify-Access-Token": session.accessToken,
            "Accept-Encoding": "application/json",
        },
    };
    const urlShop = `https://${session.shop}/admin/api/2023-07/shop.json`;
    let img;
    img = await admin.graphql(imageQuery);
    const imageInfo = await img.json();

    const imageNode = imageInfo.data.files.edges;
    //console.log('imageNode', imageNode[0].node.originalSource);
    return json({ image: imageNode });
}
export async function action({ request }) {

}
function PathSplit(urlString) {
    const urlLink = new URL(urlString);
    const paths = urlLink.pathname.split("/");
    // const nameImg = paths[paths.length - 1];
    return paths;
}
export default function ImageProcess() {
    const { image } = useLoaderData();
    const submit = useSubmit();

    const imageData = image.map((image) => {
        const dateString = image.node.createdAt;
        const dateConvert = new Date(dateString);
        const dateFormated = dateConvert.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric"
        })

        let paths = PathSplit(image.node.image.originalSrc);
        const nameImg = paths[paths.length - 1]

        const imageSize = image.node.originalSource.fileSize;
        let sizeDisplay;
        let sizeType;
        if (imageSize > 1000 && imageSize < 1000000) {
            sizeDisplay = imageSize / 1000;
            sizeDisplay = sizeDisplay.toFixed(2);
            sizeType = 'KB';
        }
        else if (imageSize > 1000000) {
            sizeDisplay = imageSize / 1000000;
            sizeDisplay = sizeDisplay.toFixed(2);
            sizeType = 'MB';
        }

        const refImgType = paths[paths.length - 2];
        let refImg = false;
        if (refImgType === "products") refImg = true;

        return {
            id: image.node.id.replace("gid://shopify/MediaImage/", ""),
            name: nameImg,
            createdAt: dateFormated,
            link: image.node.image.originalSrc,
            size: `${sizeDisplay} ${sizeType}`,
            reference: refImg ? "product" : "-"
        }
    })

    const HandleClick = (imageLink) => {
        const paths = PathSplit(imageLink);
        const nameImg = paths[paths.length - 1]

        const compressImage = async () => {
            try {
                //const res = await fetch(imageLink)
                //console.log(res.);
                let imageData = await fetch(imageLink)
                    .then(r => r.blob())
                    .then(blobFile => new File([blobFile], `Optimized ${nameImg}`, { type: "image/png" }))
                //console.log(res);
                //const imageData = await res.blob();
                //console.log(imageData);
                const compressedBlob = await new Promise((resolve, reject) => {
                    new Compressor(imageData, {
                        quality: 0.6, // Adjust the desired image quality (0.0 - 1.0)
                        mimeType: "image/jpeg", // Specify the output image format
                        success(result) {
                            //console.log(result);
                            resolve(result);
                        },
                        error(error) {
                            reject(error);
                        },
                    });
                });
                const urlCom = URL.createObjectURL(compressedBlob);
                return urlCom;
                //console.log(compressedBlob);
                //  console.log(urlCom);
            } catch (error) {
                console.error(error);
            }
        };
        const res = compressImage();
        const updateToShopify = async () => {
            try {
                console.log(res);

                res.then(result => {
                    const urlLinkfromBlob = result;


                })
                //console.log(urlLink);
                //let imageData = await 
            } catch (error) {
                console.error(error);
            }
        }
        updateToShopify();


    }
    // const { selectedResources, allResourcesSelected, handleSelectionChange } = useIndexResourceState(orders);

    const rowMarkup = imageData.map(
        (
            { id, name, createdAt, size, reference, link },
            index
        ) => (
            <IndexTable.Row
                id={id}
                key={id}
                //selected={selectedResources.includes(id)}
                position={index}
            >
                <IndexTable.Cell>
                    <Text variant="bodyMd" fontWeight="bold" as="span">
                        {"image"}
                    </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>{name}</IndexTable.Cell>
                <IndexTable.Cell>{createdAt}</IndexTable.Cell>
                <IndexTable.Cell>{size}</IndexTable.Cell>
                <IndexTable.Cell>{reference}</IndexTable.Cell>
                <IndexTable.Cell>{link}</IndexTable.Cell>
                <IndexTable.Cell>
                    <Button onClick={() => HandleClick(link)}>Optimize</Button>
                </IndexTable.Cell>

            </IndexTable.Row>
        ),
    );
    const uploadFile = () => submit({}, { replace: true, method: "POST" });
    return (
        <Page fullWidth={true}>
            <ui-title-bar title='Image Process'>
                <button variant="primary" onClick={uploadFile}>
                    Upload files

                </button>
            </ui-title-bar>
            <Layout>
                <Layout.Section>
                    {/* <input type="file" id="imageInput">
                    </input>
                    <img id="compressedImage" alt="Compressed Image"></img> */}
                    <Button onClick={() => HandleClick(imageData)}>Optimize</Button>

                </Layout.Section>

                <Layout.Section>
                    <LegacyCard>
                        <IndexTable

                            itemCount={image.length}
                            //selectedItemsCount={
                            //    allResourcesSelected ? 'All' : selectedResources.length
                            //}
                            //onSelectionChange={handleSelectionChange}
                            selectable={false}
                            headings={[
                                { title: 'Image' },
                                { title: 'File name' },
                                { title: 'Date added' },
                                { title: 'Size' },
                                { title: 'References' },
                                { title: 'Link' },
                            ]}
                        >
                            {rowMarkup}
                        </IndexTable>
                    </LegacyCard>
                </Layout.Section>
            </Layout>
        </Page>
    );
}









