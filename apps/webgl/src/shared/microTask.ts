export const nextTick = (cb: () => void) => {
  if (Promise) {
    void Promise.resolve().then(cb);
  } else {
    setTimeout(cb, 0);
  }
};
