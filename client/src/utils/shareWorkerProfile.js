export const createWorkerShareData = (worker, origin = globalThis.location?.origin || '') => ({
  title: `${worker.name} on FixNearby`,
  text: `View ${worker.name}, ${worker.profession}, on FixNearby.`,
  url: `${origin}/worker/${worker._id || worker.id}`,
});

export const shareWorkerProfile = async ({
  worker,
  navigatorObject = globalThis.navigator,
  origin,
}) => {
  const data = createWorkerShareData(worker, origin);

  if (typeof navigatorObject?.share === 'function') {
    await navigatorObject.share(data);
    return 'shared';
  }

  if (typeof navigatorObject?.clipboard?.writeText === 'function') {
    await navigatorObject.clipboard.writeText(data.url);
    return 'copied';
  }

  throw new Error('Sharing is not supported by this browser');
};
