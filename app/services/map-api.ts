import type { DailyForecast, PlaceResult, SlotForecast } from '../types/map';
import { generateMockForecast, generateSlotForecast, searchMockPlaces } from '../data/mock-forecast';

// TODO: replace with real API calls when backend endpoints are ready
// GET /place/search?address=xxx
// GET /sea-of-clouds?latitude=xxx&longitude=xxx
// GET /place/elevation?latitude=xxx&longitude=xxx

export async function searchPlaces(query: string): Promise<PlaceResult[]> {
  await new Promise((r) => setTimeout(r, 300));
  return searchMockPlaces(query);
}

export async function getForecast(
  _latitude: number,
  _longitude: number,
): Promise<DailyForecast[]> {
  await new Promise((r) => setTimeout(r, 200));
  return generateMockForecast(_latitude, _longitude);
}

export async function getSlotForecast(
  _latitude: number,
  _longitude: number,
): Promise<SlotForecast> {
  await new Promise((r) => setTimeout(r, 200));
  return generateSlotForecast(_latitude, _longitude);
}
