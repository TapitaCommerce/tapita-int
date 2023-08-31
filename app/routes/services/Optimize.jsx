import { useEffect, useState } from "react";
import Compressor from "compressorjs";


function Optimize() {
    const [compressedImageUrl, setCompressedImageUrl] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const imageUrl = new URL("https://cdn.shopify.com/s/files/1/0747/2873/5021/products/AI.jpg?v=1681527948");

    useEffect(() => {
        const compressImage = async () => {
            try {
                const res = await fetch(imageUrl);
                const imageData = await res.blob();
                console.log(imageData);
                const compressedBlob = await new Promise((resolve, reject) => {
                    new Compressor(imageData, {
                        quality: 0.6, // Adjust the desired image quality (0.0 - 1.0)
                        // Adjust the maximum width of the compressed image
                        // Adjust the maximum height of the compressed image
                        mimeType: "image/jpeg", // Specify the output image format
                        success(result) {
                            resolve(result);
                        },
                        error(error) {
                            reject(error);
                        },
                    });
                });
                const urlCom = URL.createObjectURL(compressedBlob);
                console.log(compressedBlob);
                console.log(urlCom);
                setCompressedImageUrl(urlCom);
                setIsLoading(false);
            } catch (error) {
                console.error(error);
                setIsLoading(false);
            }
        };

        compressImage();
    }, []);

    return (
        <div>
            {isLoading ? (
                <p>Loading...</p>
            ) : (
                <img src={compressedImageUrl} alt="Compressed Image" />
            )}
        </div>
    );

}

export default Optimize;    