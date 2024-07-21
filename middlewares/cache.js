module.exports = (req, res, next) => {
  // 5 minutes
  const period = 60 * 5;
  if (req.method === "GET") {
    res.set("Cache-control", `public, max-age=${period}`);
  } else {
    res.set("Cache-control", `no-store`);
  }

  next();
}