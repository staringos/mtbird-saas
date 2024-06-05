const getStorageSource = () => {
  if (typeof localStorage === "undefined") {
    return null;
  }

  return localStorage;
};

const getItem = (key: string) => {
  const storage = getStorageSource();
  if (!storage) return;
  return storage.getItem(key);
};

const setItem = (key: string, value: string) => {
  const storage = getStorageSource();
  if (!storage) return;
  storage.setItem(key, value);
};

const removeItem = (key: string) => {
  const storage = getStorageSource();
  if (!storage) return;
  storage.removeItem(key);
};

const clear = () => {
  const storage = getStorageSource();
  if (!storage) return;
  storage.clear();
};

export default {
  getItem,
  setItem,
  removeItem,
  clear,
};
