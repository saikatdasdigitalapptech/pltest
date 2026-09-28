export const capabilities = [
  { id: 'bot', title: 'AI commerce bot' },
  { id: 'behaviour', title: 'Customer behaviour intelligence' },
  { id: 'personalisation', title: 'Personalisation engine' },
  { id: 'recommendations', title: 'AI product recommendations' },
  { id: 'search', title: 'AI search and product discovery' },
  { id: 'conversational', title: 'Conversational commerce' },
  { id: 'engagement', title: 'AI-powered customer engagement' },
  { id: 'marketing', title: 'AI for marketing and conversion' },
] as const;

export const serviceOptions = [
  'AI Commerce',
  'AI shopping assistant',
  'AI search and discovery',
  'Personalisation engine',
  'Product recommendations',
  'Conversational commerce',
  'AI commerce roadmap',
] as const;
export const regionOptions = [
  'Select a region',
  'United States',
  'United Kingdom',
  'Canada',
  'Europe',
  'Australia / NZ',
  'Other',
] as const;
export interface LeadData {
  fullName: string;
  email: string;
  company: string;
  phone?: string;
  service?: string;
  region?: string;
  requirement?: string;
}
export function syntheticLead(suffix = 'default'): LeadData {
  return {
    fullName: 'Automation Tester',
    email: `qa.${suffix}@example.com`,
    company: 'Automation Test Company',
    service: 'AI Commerce',
    region: 'Other',
    requirement: 'Synthetic browser test. Shopify intent search. Intercepted locally; never sent.',
  };
}
