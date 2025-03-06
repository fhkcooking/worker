export default {
  async fetch(request) {
    const targetURL = "https://buzzfeed.com";
    let url = new URL(request.url);
    url.hostname = new URL(targetURL).hostname;

    // Forward the request with original method, headers, and body
    let modifiedRequest = new Request(url.toString(), {
      method: request.method,
      headers: request.headers,
      body: request.method !== "GET" && request.method !== "HEAD" ? request.body : null,
      redirect: "manual", // Prevents automatic redirects
    });

    let response = await fetch(modifiedRequest);

    // Modify response to avoid CORS issues
    let newHeaders = new Headers(response.headers);
    newHeaders.set("Access-Control-Allow-Origin", "*");
    newHeaders.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    newHeaders.set("Access-Control-Allow-Headers", "*");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  },
};
