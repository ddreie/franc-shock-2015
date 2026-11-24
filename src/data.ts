import raw from './data/site-data.json';

export type Category = {
  name: string; group: string; passThrough: number | null; paperPassThrough: number | null;
  sdid: number | null; sdidSe: number | null; importShare: number | null;
  ptEarly: number | null; ptLate: number | null; tradability: number | null;
};
export type PricePoint = { month: string } & Record<string, number | string>;
export type Speed = {
  months: string[];
  allItems: { pt: number; se: number }[];
  groups: Record<string, { values: number[]; n: number }>;
  medianImportShare: number;
};

export const data = raw as unknown as {
  exchangeRateChange: number; categories: Category[]; prices: PricePoint[]; speed: Speed;
  summary: Record<string, number>;
  extension: Record<string, { b: number; se: number; n: number }>;
  allItems: { sdid: number; sdidSe: number; pt: number; didHighgdp: number; didHighgdpSe: number;
    didEurope33: number; didEurope33Se: number };
  fx: { month: string; rate: number }[];
  synth: { switzerland: number[]; synthetic: number[]; lambda: number[]; weights: { country: string; weight: number }[] };
  robustness: { spec: string; sdid: number; pt: number }[];
  source: string;
};

/** Comparison groups shown in the price chart: data key -> label for a general audience. */
export const controlGroups: { key: string; label: string; short: string }[] = [
  { key: 'Europe', label: 'Europe (33 countries, GDP-weighted)', short: 'Europe (33)' },
  { key: 'Eurozone', label: 'Euro area', short: 'Euro area' },
  { key: 'EU', label: 'European Union', short: 'EU' },
  { key: 'Direct neighbours', label: 'Neighbours (DE, FR, IT, AT)', short: 'Neighbours' },
  { key: 'Germanic', label: 'German-speaking countries', short: 'German-speaking' },
  { key: 'Non-EUR', label: 'European countries without the euro', short: 'Non-euro countries' },
  { key: 'High Gdp', label: 'High-income countries', short: 'High-income' },
];

