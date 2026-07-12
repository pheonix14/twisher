import { getBlobStore } from "@netlify/blobs";

export const handler = async (event) => {
  try {
    const store = getBlobStore({
      name: "site-settings"
    });

    if (event.httpMethod === "GET") {
      const config = await store.get("config", { type: "json" });

      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify(config || { themeColor: "#6366f1" })
      };
    }

    if (event.httpMethod === "POST") {
      if (event.headers.authorization !== "pheonix14") {
        return { statusCode: 401 };
      }

      const newConfig = JSON.parse(event.body);

      await store.set("config", JSON.stringify(newConfig));

      return {
        statusCode: 200,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ message: "Success" })
      };
    }

    return { statusCode: 405 };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
