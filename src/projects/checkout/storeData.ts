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
