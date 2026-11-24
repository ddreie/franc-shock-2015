import raw from './data/site-data.json';

export type Category = {
  name: string; group: string; passThrough: number | null; paperPassThrough: number | null;
  sdid: number | null; sdidSe: number | null; importShare: number | null;
  ptEarly: number | null; ptLate: number | null;
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
  source: string;
};

/** Comparison groups shown in the price chart: data key -> label for a general audience. */
export const controlGroups: { key: string; label: string }[] = [
  { key: 'Europe', label: 'Europe (33 countries, GDP-weighted)' },
  { key: 'Eurozone', label: 'Euro area' },
  { key: 'EU', label: 'European Union' },
  { key: 'Direct neighbours', label: 'Neighbours (DE, FR, IT, AT)' },
  { key: 'Germanic', label: 'German-speaking countries' },
  { key: 'Non-EUR', label: 'European countries without the euro' },
  { key: 'High Gdp', label: 'High-income countries' },
];

const a = data.allItems;
/** Main estimates for the all-items price index (percent of the January 2015 price level). Paper: Oktay (2022), Tables 4–5. */
export const mainResults = [
  { model: 'Simple difference-in-differences', control: 'Average of 33 European countries',
    paper: { est: -1.64, se: 0.26 }, ours: { est: a.didEurope33, se: a.didEurope33Se },
    note: `The paper's −1.64 is only reproduced with a 10-country high-income average (we get ${a.didHighgdp.toFixed(2).replace('-', '−')}); the author's code uses that group by mistake.` },
  { model: 'Synthetic difference-in-differences', control: 'Weighted “synthetic Switzerland”',
    paper: { est: -1.23, se: 0.48 }, ours: { est: a.sdid, se: a.sdidSe },
    note: 'Same estimate. Standard errors come from random placebo draws, so they can differ slightly.' },
];
