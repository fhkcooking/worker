export default {
  async fetch(request) {
    const targetURL = "https://www.buzzfeed.com"; // Source website
    let url = new URL(request.url);
    url.hostname = new URL(targetURL).hostname;

    // Get the domain the worker is running on
    let currentDomain = new URL(request.url).hostname;

    // Modify request headers
    let modifiedHeaders = new Headers(request.headers);
    modifiedHeaders.set("Host", url.hostname);
    modifiedHeaders.set("Referer", targetURL);
    modifiedHeaders.set("Origin", targetURL);
    modifiedHeaders.set(
      "User-Agent",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36"
    );

    // Forward the request with modified headers
    let modifiedRequest = new Request(url.toString(), {
      method: request.method,
      headers: modifiedHeaders,
      body: request.method !== "GET" && request.method !== "HEAD" ? request.body : null,
      redirect: "follow",
    });

    let response = await fetch(modifiedRequest);

    // Clone response to modify headers and content
    let newHeaders = new Headers(response.headers);

    // Remove security policies that could force a redirect
    newHeaders.delete("Location");
    newHeaders.delete("Content-Security-Policy");
    newHeaders.delete("Strict-Transport-Security");
    newHeaders.delete("X-Frame-Options");

    // Allow CORS if needed
    newHeaders.set("Access-Control-Allow-Origin", "*");
    newHeaders.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    newHeaders.set("Access-Control-Allow-Headers", "*");

    // Convert response to text to modify links
    let contentType = newHeaders.get("Content-Type") || "";
    let body = await response.text();

    if (contentType.includes("text/html")) {
      // Dynamically replace BuzzFeed URLs with the current domain
      body = body.replace(/https?:\/\/www\.buzzfeed\.com/g, `https://${currentDomain}`);
    }

    return new Response(body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  },
};
