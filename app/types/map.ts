// 云海品质等级
export type CloudSeaLevel = 1 | 2 | 3 | 4 | 5;

export const CLOUD_SEA_LEVEL_NAMES: Record<CloudSeaLevel, string> = {
  1: '怡人级',
  2: '惊艳级',
  3: '殿堂级',
  4: '史诗级',
  5: '神话级',
};

// 宝石色系 (Gemstone) — 冷→暖，波长等间距
export const GEMSTONE_COLORS: Record<CloudSeaLevel, string> = {
  1: '#5b6fc4', // 蓝宝石
  2: '#3d9399', // 海蓝宝
  3: '#7a9e4a', // 橄榄石
  4: '#c4aa45', // 黄水晶
  5: '#cc8c42', // 琥珀
};

// 模式
export type MapMode = 'cloudsea' | 'weather';

// 地点搜索结果
export interface PlaceResult {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

// 2小时槽位预报数据点
export interface SlotData {
  time: string; // ISO 时间戳
  date: string; // MM/DD 格式
  hour: number; // 0-23
  cloudSeaProbability: number; // 0-100
  cloudSeaLevel: CloudSeaLevel;
  cloudSeaLevelName: string;
  temperature: number;
  weatherType: string; // 'clear' | 'partly-cloudy' | 'cloudy' | 'rain'
}

// 小时级预报数据点 (保留兼容)
export interface HourlyPoint {
  time: string;
  hour: number;
  cloudSeaProbability?: number;
  cloudSeaLevel?: CloudSeaLevel;
  cloudSeaLevelName?: string;
  temperature?: number;
  weatherType?: string;
}

// 6天预报（72个2小时槽位）
export interface SlotForecast {
  slots: SlotData[]; // 72 slots (6 days × 12/day)
  maxCloudSeaProb: number;
  bestSlot: SlotData;
}

// 每天预报 (保留兼容)
export interface DailyForecast {
  date: string;
  maxCloudSeaProb?: number;
  maxCloudSeaLevel?: CloudSeaLevel;
  maxTemp?: number;
  minTemp?: number;
  hourly: HourlyPoint[];
}
