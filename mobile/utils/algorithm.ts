import { Report } from "@/types/types";

// Harvsine Distance algorithm
export const haversineDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// DBSCAN (Density Based Spatial Clustering of Applications with Noise)
export const dbscan = (reports: Report[], epsilon: number, minPts: number) => {
  const visited = new Set<string>();
  const noise = new Set<string>();
  const clusterMap = new Set<string>();
  const clusters: Report[][] = [];

  const getNeighbours = (report: Report) =>
    reports.filter(
      (r) =>
        r._id !== report._id &&
        haversineDistance(
          report.location.latitude,
          report.location.longitude,
          r.location.latitude,
          r.location.longitude,
        ) <= epsilon,
    );

  for (const report of reports) {
    if (visited.has(report._id)) continue;
    visited.add(report._id);

    const neighbours = getNeighbours(report);
    if (neighbours.length < minPts) {
      noise.add(report._id);
      continue;
    }

    const cluster: Report[] = [report];
    clusterMap.add(report._id);
    const queue = [...neighbours];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (!visited.has(current._id)) {
        visited.add(current._id);
        const currentNeighbours = getNeighbours(current);
        if (currentNeighbours.length >= minPts) {
          queue.push(...currentNeighbours);
        }
      }
      if (!clusterMap.has(current._id)) {
        cluster.push(current);
        clusterMap.add(current._id);
      }
    }
    clusters.push(cluster);
  }
  return {
    clusters,
    noise: reports.filter((r) => noise.has(r._id)),
  };
};
