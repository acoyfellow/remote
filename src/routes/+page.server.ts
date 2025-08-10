import { getCounter } from './data.remote.js';

export async function load({ url }) {
  
  const counterId = url.searchParams.get('id') || 'default';
  
  try {
    const counterData = await getCounter(counterId);
    
    return {
      counterId,
      counterData,
      ssrTimestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error(error);
    const fallback = { count: 0, id: 'unavailable', timestamp: new Date().toISOString() };
    return {
      counterId,
      counterData: fallback,
      ssrError: error instanceof Error ? error.message : String(error),
      ssrTimestamp: new Date().toISOString()
    };
  }
}
