export const nextTick = (cb: () => void) => {
  if (Promise) {
    void Promise.resolve().then(cb);
  } else {
    setTimeout(cb, 0);
  }
};

export const getUUID = (randomLength: number) => {
  return Number(
    Math.random()
      .toString()
      .substr(2, randomLength) + Date.now()
  ).toString(36);
};
