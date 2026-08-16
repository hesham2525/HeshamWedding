const wishesStorageKey = "wedding-wishes";

function readStoredWishes() {
  try {
    const storedWishes = window.localStorage.getItem(wishesStorageKey);
    const wishes = storedWishes ? JSON.parse(storedWishes) : [];

    return Array.isArray(wishes) ? wishes : [];
  } catch {
    return [];
  }
}

function writeStoredWishes(wishes) {
  window.localStorage.setItem(wishesStorageKey, JSON.stringify(wishes));
}

function createWishId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function getWishes() {
  return readStoredWishes().sort(
    (firstWish, secondWish) =>
      new Date(secondWish.created_at).getTime() -
      new Date(firstWish.created_at).getTime()
  );
}

export function saveWish({ name, message }) {
  const wish = {
    id: createWishId(),
    name,
    message,
    created_at: new Date().toISOString(),
  };

  writeStoredWishes([wish, ...readStoredWishes()]);
  return wish;
}

export function clearWishes() {
  window.localStorage.removeItem(wishesStorageKey);
}
