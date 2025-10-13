interface PageView {
  variantId: string;
  timestamp: number;
}

let pageViews: PageView[] = [];

export const recordPageView = (variantId: string): void => {
  pageViews.push({ variantId, timestamp: Date.now() });
  // Optional: Clean up old page views to prevent memory issues
  // For a real application, this would be persisted in a database
  cleanupOldPageViews();
};

const cleanupOldPageViews = (): void => {
  const seventyTwoHoursAgo = Date.now() - (72 * 60 * 60 * 1000);
  pageViews = pageViews.filter(view => view.timestamp > seventyTwoHoursAgo);
};

export const getPopularVariants = (windowHours: number = 72): { variantId: string; viewCount: number }[] => {
  const cutoffTime = Date.now() - (windowHours * 60 * 60 * 1000);
  const recentPageViews = pageViews.filter(view => view.timestamp > cutoffTime);

  const viewCounts: { [key: string]: number } = {};
  recentPageViews.forEach(view => {
    viewCounts[view.variantId] = (viewCounts[view.variantId] || 0) + 1;
  });

  const sortedPopularity = Object.entries(viewCounts)
    .map(([variantId, viewCount]) => ({ variantId, viewCount }))
    .sort((a, b) => b.viewCount - a.viewCount);

  return sortedPopularity;
};
