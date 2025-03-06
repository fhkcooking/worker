export default {
  async fetch(request) {
    let currentDomain = new URL(request.url).hostname;
    let subdomain = currentDomain.split(".")[0];

    let targetHost = "www.buzzfeed.com";
    if (subdomain !== "www" && subdomain !== currentDomain) {
      targetHost = `${subdomain}.buzzfeed.com`;
    }

    let url = new URL(request.url);
    url.hostname = targetHost;

    // Modify request headers
    let modifiedHeaders = new Headers(request.headers);
    modifiedHeaders.set("Host", targetHost);
    modifiedHeaders.set("Referer", `https://${targetHost}`);
    modifiedHeaders.set("Origin", `https://${targetHost}`);
    modifiedHeaders.set(
      "User-Agent",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36"
    );

    // Forward request but prevent automatic redirects
    let modifiedRequest = new Request(url.toString(), {
      method: request.method,
      headers: modifiedHeaders,
      body: request.method !== "GET" && request.method !== "HEAD" ? request.body : null,
      redirect: "manual", // Prevent redirects from being auto-followed
    });

    let response = await fetch(modifiedRequest);

    // Clone response to modify headers and content
    let newHeaders = new Headers(response.headers);

    // Block BuzzFeed’s redirect responses
    if (response.status >= 300 && response.status < 400) {
      let redirectLocation = response.headers.get("Location");
      if (redirectLocation) {
        // Rewrite the redirect location to your domain instead
        redirectLocation = redirectLocation.replace(/https?:\/\/([a-z0-9-]+)\.buzzfeed\.com/g, `https://${currentDomain}`);
        newHeaders.set("Location", redirectLocation);
      }
      return new Response(null, {
        status: response.status,
        headers: newHeaders,
      });
    }

    // Remove security headers that might enforce redirects
    newHeaders.delete("Content-Security-Policy");
    newHeaders.delete("Strict-Transport-Security");
    newHeaders.delete("X-Frame-Options");

    // Allow CORS if needed
    newHeaders.set("Access-Control-Allow-Origin", "*");
    newHeaders.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    newHeaders.set("Access-Control-Allow-Headers", "*");

    let contentType = newHeaders.get("Content-Type") || "";
    let body = await response.text();

    if (contentType.includes("text/html")) {
      // Replace BuzzFeed URLs with the current domain dynamically
      body = body.replace(/https?:\/\/([a-z0-9-]+)\.buzzfeed\.com/g, `https://${currentDomain}`);
      body = body.replace(/https?:\/\/www\.buzzfeed\.com/g, `https://${currentDomain}`);
    }

    return new Response(body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  },
};
