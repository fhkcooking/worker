export default {
  async fetch(request) {
    const targetURL = "https://buzzfeed.com";
    let url = new URL(request.url);
    url.hostname = new URL(targetURL).hostname;

    // Modify request headers to appear as a normal browser
    let modifiedHeaders = new Headers(request.headers);
    modifiedHeaders.set("Host", url.hostname);
    modifiedHeaders.set("Referer", targetURL);
    modifiedHeaders.set("Origin", targetURL);
    modifiedHeaders.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36");

    // Forward the request with modified headers
    let modifiedRequest = new Request(url.toString(), {
      method: request.method,
      headers: modifiedHeaders,
      body: request.method !== "GET" && request.method !== "HEAD" ? request.body : null,
      redirect: "follow", // Follow redirects properly
    });

    let response = await fetch(modifiedRequest);

    // Clone the response so we can modify headers
    let newHeaders = new Headers(response.headers);

    // Remove security policies that could force a redirect
    newHeaders.delete("Location"); // Prevents forced redirects
    newHeaders.delete("Content-Security-Policy");
    newHeaders.delete("Strict-Transport-Security");
    newHeaders.delete("X-Frame-Options");
    
    // Allow CORS if needed
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
