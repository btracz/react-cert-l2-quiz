module.exports = {
  default: new Proxy(
    {},
    {
      get: (_, prop) => {
        return prop.toString();
      },
    }
  ),
};
