export const stringify = (item: unknown) => {
  if (item instanceof Error) {
    return `${item.name}: ${item.message}${
      item.stack ? `\n${item.stack}\n` : ''
    }`;
  }

  if (typeof item === 'object' && String(item) === '[object Object]') {
    try {
      return JSON.stringify(item);
    } catch {
      // fall through
    }
  }

  return item;
};
