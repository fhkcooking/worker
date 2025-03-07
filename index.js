export default {
  async fetch(request) {
    const targetURL = "https://www.buzzfeed.com"; // Source website
    let url = new URL(request.url);
    url.hostname = new URL(targetURL).hostname;

    let currentDomain = new URL(request.url).hostname;

    let modifiedHeaders = new Headers(request.headers);
    modifiedHeaders.set("Host", url.hostname);
    modifiedHeaders.set("Referer", targetURL);
    modifiedHeaders.set("Origin", targetURL);
    modifiedHeaders.set(
      "User-Agent",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36"
    );

    let modifiedRequest = new Request(url.toString(), {
      method: request.method,
      headers: modifiedHeaders,
      body: request.method !== "GET" && request.method !== "HEAD" ? request.body : null,
      redirect: "follow",
    });

    let response = await fetch(modifiedRequest);

    let newHeaders = new Headers(response.headers);
    newHeaders.delete("Location");
    newHeaders.delete("Content-Security-Policy");
    newHeaders.delete("Strict-Transport-Security");
    newHeaders.delete("X-Frame-Options");

    newHeaders.set("Access-Control-Allow-Origin", "*");
    newHeaders.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    newHeaders.set("Access-Control-Allow-Headers", "*");

    let contentType = newHeaders.get("Content-Type") || "";
    let body = await response.text();

    if (contentType.includes("text/html")) {
      body = body.replace(/https?:\/\/www\.buzzfeed\.com/g, `https://${currentDomain}`);

      // Inject JavaScript to modify the SVG logo
      body = body.replace("</body>", `
        <script>
          document.addEventListener("DOMContentLoaded", function() {
            let logo = document.querySelector('svg[aria-labelledby="js-bfo-logo-title"]');
            if (logo) {
              let trendsText = document.createElement("span");
              trendsText.innerText = "Trends";
              trendsText.style.fontSize = "24px";
              trendsText.style.color = "black";
              trendsText.style.fontWeight = "bold";
              trendsText.style.marginLeft = "10px";
              trendsText.style.position = "relative";
              trendsText.style.top = "-5px";
              
              logo.parentNode.insertBefore(trendsText, logo.nextSibling);
            }
          });
        </script>
      </body>`);
    }

    return new Response(body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  },
};
