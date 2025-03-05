export default {
  async fetch(request) {
    // Change this to the site you want to proxy
    const targetURL = "https://buzzfeed.com";

    // Modify the request to send it to the target URL
    let url = new URL(request.url);
    url.hostname = new URL(targetURL).hostname;

    // Forward the request
    return fetch(url.toString(), request);
  }
};
