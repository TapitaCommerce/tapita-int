import { json } from "@remix-run/node";
import axios from "axios";
import { authenticate } from "../shopify.server";

export default async function handler(req, res) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { session } = await authenticate.admin(req);
  const { shop } = session;
  const pageId = req.query.id;

  const { title, description } = req.body;

  const config = {
    headers: {
      "X-Shopify-Access-Token": session.accessToken,
      "Content-Type": "application/json",
    },
  };

  const pageData = {
    page: {
      id: pageId,
      title: title,
      body_html: description,
    },
  };

  try {
    const response = await axios.put(
      `https://${shop}/admin/api/2023-07/pages/${pageId}.json`,
      pageData,
      config
    );

    if (response.status === 200) {
      res.json({ success: true, message: "Page updated successfully" });
    } else {
      res.status(response.status).json({
        success: false,
        message: "Failed to update page",
      });
    }
  } catch (error) {
    console.error("Error updating page:", error);
    res.status(500).json({ success: false, message: "Error updating page" });
  }
}
