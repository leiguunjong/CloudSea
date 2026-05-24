import type { SlotData, SlotForecast, DailyForecast, PlaceResult, CloudSeaLevel } from '../types/map';

const WEATHER_TYPES = ['clear', 'partly-cloudy', 'cloudy', 'rain'];

function seedRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function getLevel(prob: number): CloudSeaLevel {
  if (prob >= 90) return 5;
  if (prob >= 75) return 4;
  if (prob >= 55) return 3;
  if (prob >= 30) return 2;
  return 1;
}

const LEVEL_NAMES: Record<number, string> = {
  5: '神话级', 4: '史诗级', 3: '殿堂级', 2: '惊艳级', 1: '怡人级',
};

function formatDateStr(d: Date): string {
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

// 生成6天72个2小时间隔槽位
export function generateSlotForecast(latitude: number, longitude: number): SlotForecast {
  const baseSeed = Math.abs(Math.round(latitude * 100000 + longitude * 100000));
  const rand = seedRandom(baseSeed);
  const baseProb = 35 + rand() * 45;

  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  const slots: SlotData[] = [];

  for (let day = 0; day < 6; day++) {
    const currentDate = new Date(yesterday);
    currentDate.setDate(currentDate.getDate() + day);
    const dateStr = formatDateStr(currentDate);

    for (let slot = 0; slot < 12; slot++) {
      const hour = slot * 2;
      // 云海概率: 清晨高、正午低
      const hourFactor = 1 - Math.abs(hour - 6) / 10; // peak around 6am
      const dayFactor = 0.5 + rand() * 1.0;
      const prob = Math.min(100, Math.max(0,
        Math.round(baseProb * (0.3 + hourFactor * 0.9) * dayFactor + rand() * 15 - 5),
      ));
      const level = getLevel(prob);
      const temp = Math.round(12 + hourFactor * 10 + rand() * 8);
      const weatherIdx = Math.floor((rand() * 0.7 + (1 - hourFactor) * 0.3) * WEATHER_TYPES.length);

      const slotDate = new Date(currentDate);
      slotDate.setHours(hour, 0, 0, 0);

      slots.push({
        time: slotDate.toISOString(),
        date: dateStr,
        hour,
        cloudSeaProbability: prob,
        cloudSeaLevel: level,
        cloudSeaLevelName: LEVEL_NAMES[level],
        temperature: temp,
        weatherType: WEATHER_TYPES[weatherIdx],
      });
    }
  }

  const bestSlot = slots.reduce((a, b) =>
    b.cloudSeaProbability > a.cloudSeaProbability ? b : a,
  );

  return {
    slots,
    maxCloudSeaProb: bestSlot.cloudSeaProbability,
    bestSlot,
  };
}

// 保留兼容：生成 DailyForecast[] 格式
export function generateMockForecast(latitude: number, longitude: number): DailyForecast[] {
  const forecast = generateSlotForecast(latitude, longitude);
  const days: DailyForecast[] = [];

  for (let d = 0; d < 5; d++) {
    const daySlots = forecast.slots.slice(d * 12, (d + 1) * 12);
    const probs = daySlots.map((s) => s.cloudSeaProbability);
    const temps = daySlots.map((s) => s.temperature);

    days.push({
      date: daySlots[0].time,
      maxCloudSeaProb: Math.max(...probs),
      maxCloudSeaLevel: daySlots.reduce((a, b) =>
        b.cloudSeaProbability > a.cloudSeaProbability ? b : a,
      ).cloudSeaLevel,
      maxTemp: Math.round(Math.max(...temps)),
      minTemp: Math.round(Math.min(...temps)),
      hourly: daySlots.map((s) => ({
        time: s.time,
        hour: s.hour,
        cloudSeaProbability: s.cloudSeaProbability,
        cloudSeaLevel: s.cloudSeaLevel,
        cloudSeaLevelName: s.cloudSeaLevelName,
        temperature: s.temperature,
        weatherType: s.weatherType,
      })),
    });
  }

  return days;
}

export const MOCK_PLACES: Record<string, PlaceResult> = {
  黄山: {
    id: '1',
    name: '黄山',
    address: '安徽省黄山市',
    latitude: 30.1367,
    longitude: 118.1689,
  },
  峨眉山: {
    id: '2',
    name: '峨眉山',
    address: '四川省乐山市峨眉山市',
    latitude: 29.6060,
    longitude: 103.4930,
  },
  泰山: {
    id: '3',
    name: '泰山',
    address: '山东省泰安市',
    latitude: 36.2558,
    longitude: 117.1250,
  },
};

export function searchMockPlaces(query: string): PlaceResult[] {
  return Object.values(MOCK_PLACES).filter(
    (p) => p.name.includes(query) || p.address.includes(query),
  );
}
