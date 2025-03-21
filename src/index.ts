import { Hono } from "hono";
import { ContentfulStatusCode, StatusCode } from "hono/utils/http-status";
import { cors } from "hono/cors";

const app = new Hono();

app.use("*", async (c, next) => {
  const corsMiddlewareHandler = cors({
    origin: process.env.CORS_ORIGIN?.split(",") ??[
      "http://localhost:3000",
      "http://localhost:3001",
    ],
    allowHeaders: ["*"],
    allowMethods: ["GET", "OPTIONS"],
    exposeHeaders: ["Content-Length", "Content-Type"],
    maxAge: 600,
    credentials: true,
  });
  return corsMiddlewareHandler(c, next);
});

app.get("/", (c) => {
  return c.text("ok");
});

app.get("/proxy/*", async (c) => {
  const reqUrl = c.req.url.split("/").slice(4);
  const headers = c.req.header();

  const url = reqUrl
    .map((part) => (part === "https:" ? part + "//" : part + "/"))
    .join("");

  const res = await fetch(url, {
    headers: {
      Accept: `*/*`,
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
      Referer: "https://megacloud.club/",
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "same-site",
      Origin: "http://localhost:3000",
      Connection: "keep-alive",
      "Accept-Encoding": "gzip, deflate, br, zstd",
      "Accept-Language": "en-US,en;q=0.9",
      "sec-ch-ua": `"Chromium";v="134", "Not:A-Brand";v="24", "Brave";v="134"`,
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": `"Linux"`,
      "Sec-GPC": "1",
    },
  });

  if (!res.ok) {
    return c.json(
      {
        res,
        status: res.status,
        statusText: res.statusText,
        headers: res.headers,
      },
      {
        status: res.status as ContentfulStatusCode,
        statusText: res.statusText,
        headers: res.headers,
      }
    );
  } else {
    return c.newResponse(await res.arrayBuffer(), res.status as StatusCode, {
      "Content-Type":
        res.headers.get("Content-Type") || "application/octet-stream",
      "Content-Length": res.headers.get("Content-Length") || "0",
    });
  }
});

export default app;
