import raw from './data/site-data.json';

export type Category = {
  name: string; group: string; passThrough: number | null;
  did: number | null; didSe: number | null; didP: number | null; importShare: number | null;
};
export type PricePoint = { month: string } & Record<string, number | string>;

export const data = raw as unknown as {
  exchangeRateChange: number; categories: Category[]; prices: PricePoint[]; source: string;
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

/**
 * Main estimates for the all-items price index (percent of the January 2015 price level).
 * "Paper": Oktay (2022), Tables 4–5. "Ours": numbers from our replication report (draft) –
 * to be replaced by the output of analysis/ once the R replication is in the repository.
 */
export const mainResults = [
  { model: 'Simple difference-in-differences', control: 'Average of European countries',
    paper: { est: -1.64, se: 0.26 }, ours: { est: -1.29, se: 0.28 },
    note: 'Our number uses the 33-country European average described in the paper. The published −1.64 is reproduced only with a 10-country high-income group.' },
  { model: 'Synthetic difference-in-differences', control: 'Weighted “synthetic Switzerland”',
    paper: { est: -1.23, se: 0.48 }, ours: { est: -1.23, se: 0.50 },
    note: 'Identical point estimate. The standard error differs slightly because placebo standard errors are random.' },
];
