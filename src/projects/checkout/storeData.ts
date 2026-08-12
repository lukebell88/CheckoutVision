import type { Store } from './stores';

/**
 * Static store data for the Collection step.
 *
 * The live "collect in store" endpoint (Next's CollectInStoreEnquiry) only sends
 * its own origin cross-origin, so on the static GitHub Pages build it had to go
 * through public CORS relays — flaky and slow. This replaces that with frozen
 * data in the exact shape the API returned, so the step is instant and offline.
 *
 * NOTE: these rows are SAMPLE data for the prototype — real Next retail-park
 * locations for the two cities, but the branch numbers, distances and opening
 * messages are illustrative, not scraped. To use the genuine API response,
 * paste the branches from `/next-api/CollectInStoreEnquiry?location=<city>`
 * (available in dev) over the arrays below; the fields already match.
 */

export const NOTTINGHAM_STORES: Store[] = [
  {
    branchNumber: '445',
    name: 'Nottingham Riverside',
    address: 'Riverside Retail Park, Queens Drive, Nottingham',
    postcode: 'NG2 1RT',
    distanceMiles: 1.2,
    openingMessage: '09:00 - 20:00',
    isOpen: true,
  },
  {
    branchNumber: '203',
    name: 'Nottingham Victoria Centre',
    address: 'Victoria Centre, Milton Street, Nottingham',
    postcode: 'NG1 3QN',
    distanceMiles: 2.5,
    openingMessage: '09:00 - 18:00',
    isOpen: true,
  },
  {
    branchNumber: '556',
    name: 'Beeston',
    address: 'The Square, Beeston, Nottingham',
    postcode: 'NG9 2JG',
    distanceMiles: 3.9,
    openingMessage: 'Closed - opens 09:00',
    isOpen: false,
  },
  {
    branchNumber: '812',
    name: 'Giltbrook',
    address: 'Ikano Retail Centre, Giltbrook, Nottingham',
    postcode: 'NG16 2RP',
    distanceMiles: 4.8,
    openingMessage: '10:00 - 20:00',
    isOpen: true,
  },
  {
    branchNumber: '318',
    name: 'Long Eaton',
    address: 'High Street, Long Eaton, Nottingham',
    postcode: 'NG10 1LH',
    distanceMiles: 5.6,
    openingMessage: '09:00 - 17:30',
    isOpen: true,
  },
];

/**
 * Parcel shops (the "Parcel Shop" delivery method) — third-party collection
 * points near the shopper. Same Store shape as the branches above; sample data.
 */
export const NOTTINGHAM_PARCEL_SHOPS: Store[] = [
  {
    branchNumber: 'p101',
    name: 'Nisa',
    address: 'Wilsthorpe Rd, Long Eaton',
    postcode: 'NG10 3JX',
    distanceMiles: 0.3,
    openingMessage: '07:00 - 22:00',
    isOpen: true,
  },
  {
    branchNumber: 'p102',
    name: 'Post Office New Sawley',
    address: '459a Tamworth Road, Sawley, Long Eaton',
    postcode: 'NG10 3GL',
    distanceMiles: 0.7,
    openingMessage: '09:00 - 17:30',
    isOpen: true,
  },
  {
    branchNumber: 'p103',
    name: 'County Express',
    address: '509 Tamworth Road, Sawley, Long Eaton',
    postcode: 'NG10 3GR',
    distanceMiles: 0.9,
    openingMessage: '06:00 - 22:00',
    isOpen: true,
  },
  {
    branchNumber: 'p104',
    name: 'Booze Village',
    address: '49 Tamworth Road',
    postcode: 'NG10 1AX',
    distanceMiles: 1.2,
    openingMessage: '10:00 - 22:00',
    isOpen: true,
  },
  {
    branchNumber: 'p105',
    name: 'Post Office Long Eaton',
    address: '53-55 Market Place, Long Eaton',
    postcode: 'NG10 1JQ',
    distanceMiles: 1.6,
    openingMessage: '09:00 - 17:30',
    isOpen: true,
  },
];

export const LEICESTER_PARCEL_SHOPS: Store[] = [
  {
    branchNumber: 'p201',
    name: 'Nisa Local',
    address: '84 London Road, Leicester',
    postcode: 'LE2 0QD',
    distanceMiles: 0.4,
    openingMessage: '07:00 - 22:00',
    isOpen: true,
  },
  {
    branchNumber: 'p202',
    name: 'Post Office Clarendon Park',
    address: '73 Queens Road, Leicester',
    postcode: 'LE2 1TT',
    distanceMiles: 0.8,
    openingMessage: '09:00 - 17:30',
    isOpen: true,
  },
  {
    branchNumber: 'p203',
    name: 'Premier Store',
    address: '162 Narborough Road, Leicester',
    postcode: 'LE3 0LF',
    distanceMiles: 1.1,
    openingMessage: '06:30 - 23:00',
    isOpen: true,
  },
  {
    branchNumber: 'p204',
    name: 'Costcutter',
    address: '221 Welford Road, Leicester',
    postcode: 'LE2 6BF',
    distanceMiles: 1.5,
    openingMessage: '07:00 - 22:00',
    isOpen: true,
  },
];

export const LEICESTER_STORES: Store[] = [
  {
    branchNumber: '677',
    name: 'Fosse Park',
    address: 'Fosse Park Avenue, Enderby, Leicester',
    postcode: 'LE19 1HX',
    distanceMiles: 2.1,
    openingMessage: '09:00 - 20:00',
    isOpen: true,
  },
  {
    branchNumber: '804',
    name: 'Grove Park',
    address: 'Grove Park, Enderby, Leicester',
    postcode: 'LE19 1SY',
    distanceMiles: 2.6,
    openingMessage: '10:00 - 20:00',
    isOpen: true,
  },
  {
    branchNumber: '129',
    name: 'Leicester Highcross',
    address: 'Highcross Shopping Centre, Shires Lane, Leicester',
    postcode: 'LE1 4FP',
    distanceMiles: 3.4,
    openingMessage: '09:00 - 18:00',
    isOpen: true,
  },
  {
    branchNumber: '451',
    name: 'Beaumont Leys',
    address: 'Beaumont Shopping Centre, Leicester',
    postcode: 'LE4 1DE',
    distanceMiles: 4.7,
    openingMessage: 'Closed - opens 09:00',
    isOpen: false,
  },
];
