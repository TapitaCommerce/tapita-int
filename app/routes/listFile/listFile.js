import axios from "axios";
import "@shopify/shopify-api/adapters/node";
import shopify from "~/shopify.server";
import { json } from "@remix-run/node";

export const loader = async ({ request }) => {
  const { session } = await shopify.authenticate.admin(request);
  let imageInf;
  const config = {
    headers: {
      "X-Shopify-Access-Token": session.accessToken,
      "Accept-Encoding": "application/json",
    },
  };
  imageInf = await axios.get(
    `https://${session.shop}/admin/api/2023-07/shop.json`,
    config
  );
  console.log(imageInf.data);
  return json({ imageInf: imageInf.data });
};

export default function listFile() {
  return <></>;
}
