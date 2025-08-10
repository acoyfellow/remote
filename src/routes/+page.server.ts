import { getCounter } from './data.remote.js';

export async function load({ url }) {
  const ssrStart = performance.now();
  const counterId = url.searchParams.get('id') || 'default';
  
  try {
    const dataStart = performance.now();
    const counterData = await getCounter(counterId);
    const dataEnd = performance.now();
    const ssrEnd = performance.now();
    
    return {
      counterId,
      counterData,
      ssrTimestamp: new Date().toISOString(),
      ssrTiming: {
        total: ssrEnd - ssrStart,
        dataFetch: dataEnd - dataStart,
        backend: counterData.timing?.backend,
        worker: counterData.timing?.worker,
        durableObject: counterData.timing?.durableObject
      }
    };
  } catch (error) {
    console.error(error);
    const ssrEnd = performance.now();
    const fallback = { count: 0, id: 'unavailable', timestamp: new Date().toISOString() };
    return {
      counterId,
      counterData: fallback,
      ssrError: error instanceof Error ? error.message : String(error),
      ssrTimestamp: new Date().toISOString(),
      ssrTiming: {
        total: ssrEnd - ssrStart,
        dataFetch: 0
      }
    };
  }
}
