import {
    IndexTable,
    LegacyCard,
    useIndexResourceState,
    Text,
    Button,
    Page,
    Layout,

} from '@shopify/polaris';
import Compressor from 'compressorjs';
import { useEffect, useState } from "react";
import { useActionData, useLoaderData, useSubmit } from '@remix-run/react';
import { authenticate } from '~/shopify.server';
import { json } from '@remix-run/node';
import axios from 'axios';
import { GET_IMAGE, POST_IMAGE } from '~/graphql/imageQuery';

export async function loader({ request }) {
    const { admin } = await authenticate.admin(request);

    let img = await admin.graphql(GET_IMAGE);
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
    return paths;
}
export default function ImageProcess() {
    //const [compressedImageUrl, setCompressedImageUrl] = useState('');
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

    const HandleClick = async (imageLink) => {
        const paths = PathSplit(imageLink);
        const nameImg = paths[paths.length - 1]

        const compressImage = async () => {
            try {
                let imageData = await fetch(imageLink)
                    .then(r => r.blob())
                    .then(blobFile => new File([blobFile], `Optimized_${nameImg}`, { type: "image/png" }))
                const compressedBlob = await new Promise((resolve, reject) => {
                    new Compressor(imageData, {
                        quality: 0.6, // Adjust the desired image quality (0.0 - 1.0)
                        mimeType: "image/jpeg", // Specify the output image format
                        success(result) {
                            const formData = new FormData();
                            formData.append('name', result.name);
                            formData.append('tenfile', result, result.name);
                            axios.post('http://localhost:3000/uploads', formData).then(() => {
                                console.log('Upload success!');
                            })
                                .catch(err => {
                                    console.log(err);
                                })
                            resolve(result);
                        },
                        error(error) {
                            reject(error);
                        },
                    });
                });
                const urlCom = `https://serial-lab-univ-rfc.trycloudflare.com/uploads/` + `${compressedBlob.name}`;
                return urlCom;
            } catch (error) {
                console.error(error);
            }
        };
        const compressedImageUrl = await compressImage();
        // console.log(compressedImageUrl);
        const updateImage = async ({ request }) => {
            const { admin } = await authenticate.admin(request);
            //const sourceFileURL = 

            console.log(admin);
            let imgPost = await admin.graphql(POST_IMAGE, {
                variables: {
                    files: {
                        alt: "Optimized Image",
                        contentType: "IMAGE",
                        originalSource: compressedImageUrl
                    }
                }
            });
            const resImgPost = await imgPost.json();
            console.log(resImgPost);
        }
        //updateImage()

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









