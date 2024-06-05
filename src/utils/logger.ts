const loggerGenerator = () => {
  const global = typeof window !== "undefined" ? window : {};
  // https://blog.csdn.net/Rob_gao/article/details/99673663
  const hmt = (global as any)._hmt || { push: () => {} }; // ?.push([‘_trackEvent’, category, action, opt_label,opt_value]);
  return {
    log: (
      category: string,
      action: string,
      opt_label?: string,
      opt_value?: string
    ) => {
      hmt.push([
        "_trackEvent",
        category,
        action,
        opt_label,
        { href: location.href },
      ]);
    },
  };
};

const logger = loggerGenerator();

export default logger;
