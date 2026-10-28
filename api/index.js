const app = require("../server");

module.exports = (req, res) => {
  const requestUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const rewrittenPath = requestUrl.searchParams.get("__path");

  if (rewrittenPath) {
    requestUrl.searchParams.delete("__path");
    req.url = `${rewrittenPath}${requestUrl.search}`;
  }

  return app(req, res);
};
