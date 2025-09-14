export const stringify = (item: unknown) => {
  if (item instanceof Error) {
    return `${item.name}: ${item.message}${
      item.stack ? `\n${item.stack}\n` : ''
    }`;
  }

  // eslint-disable-next-line @typescript-eslint/no-base-to-string -- intentionally checking for default object string
  if (typeof item === 'object' && String(item) === '[object Object]') {
    try {
      return JSON.stringify(item);
    } catch {
      // fall through
    }
  }

  return item;
};
