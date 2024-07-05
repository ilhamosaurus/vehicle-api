const vehicles = [
  {
    brand: 'Mercedes-Benz',
    model: '300D',
    year: 1993,
    price: 4282592529.71,
    type: 'Combustion Engine',
  },
  {
    brand: 'Plymouth',
    model: 'Neon',
    year: 2001,
    price: 2518399312.49,
    type: 'Combustion Engine',
  },
  {
    brand: 'Aston Martin',
    model: 'V8 Vantage',
    year: 2012,
    price: 2498254005.45,
    type: 'Hybrid',
  },
  {
    brand: 'Mazda',
    model: 'MX-3',
    year: 1994,
    price: 4063215360.87,
    type: 'Hybrid',
  },
  {
    brand: 'Pontiac',
    model: 'Grand Prix',
    year: 1987,
    price: 9941860331.74,
    type: 'Combustion Engine',
  },
  {
    brand: 'Suzuki',
    model: 'Vitara',
    year: 2003,
    price: 2746104955.41,
    type: 'EV',
  },
  {
    brand: 'Nissan',
    model: 'Stanza',
    year: 1992,
    price: 5408737864.03,
    type: 'Hybrid',
  },
  {
    brand: 'Volkswagen',
    model: 'Eurovan',
    year: 1997,
    price: 3530191824.18,
    type: 'Hybrid',
  },
  {
    brand: 'Mitsubishi',
    model: 'Truck',
    year: 1990,
    price: 8036942414.58,
    type: 'Combustion Engine',
  },
  {
    brand: 'Chevrolet',
    model: 'Prizm',
    year: 1999,
    price: 2261381272.04,
    type: 'EV',
  },
  {
    brand: 'Ford',
    model: 'Transit Connect',
    year: 2010,
    price: 866651941.81,
    type: 'Combustion Engine',
  },
  {
    brand: 'Saturn',
    model: 'Relay',
    year: 2005,
    price: 1069099274.21,
    type: 'EV',
  },
  {
    brand: 'Chevrolet',
    model: 'Metro',
    year: 1998,
    price: 9481280370.02,
    type: 'Hybrid',
  },
  {
    brand: 'Mercury',
    model: 'Mountaineer',
    year: 2009,
    price: 8483010365.94,
    type: 'Hybrid',
  },
  {
    brand: 'Infiniti',
    model: 'G',
    year: 2000,
    price: 636237632.34,
    type: 'Hybrid',
  },
  {
    brand: 'MINI',
    model: 'Cooper Clubman',
    year: 2011,
    price: 3791600656.61,
    type: 'Hybrid',
  },
  {
    brand: 'Mitsubishi',
    model: 'Lancer',
    year: 2009,
    price: 1382915202.41,
    type: 'EV',
  },
  {
    brand: 'Honda',
    model: 'Fit',
    year: 2012,
    price: 6263444153.87,
    type: 'EV',
  },
  {
    brand: 'BMW',
    model: '3 Series',
    year: 2009,
    price: 4849032050.76,
    type: 'EV',
  },
  {
    brand: 'Mitsubishi',
    model: 'Lancer',
    year: 2007,
    price: 5075870255.19,
    type: 'EV',
  },
  {
    brand: 'Toyota',
    model: 'Solara',
    year: 2007,
    price: 5744545302.42,
    type: 'Hybrid',
  },
  {
    brand: 'Chevrolet',
    model: 'Metro',
    year: 2001,
    price: 1997733057.13,
    type: 'EV',
  },
  {
    brand: 'Isuzu',
    model: 'Rodeo',
    year: 2004,
    price: 6910325097.21,
    type: 'Combustion Engine',
  },
  {
    brand: 'Toyota',
    model: 'RAV4',
    year: 2003,
    price: 334547779.09,
    type: 'Combustion Engine',
  },
  {
    brand: 'Buick',
    model: 'Skylark',
    year: 1987,
    price: 9086644913.81,
    type: 'Hybrid',
  },
  {
    brand: 'Pontiac',
    model: 'Grand Prix',
    year: 1980,
    price: 5788574483.53,
    type: 'Hybrid',
  },
  {
    brand: 'Toyota',
    model: 'Sienna',
    year: 1998,
    price: 2369954747.14,
    type: 'Combustion Engine',
  },
  {
    brand: 'Citroën',
    model: 'CX',
    year: 1974,
    price: 3191616190.72,
    type: 'EV',
  },
  {
    brand: 'Kia',
    model: 'Sephia',
    year: 1998,
    price: 3717627066.2,
    type: 'Hybrid',
  },
  {
    brand: 'Tesla',
    model: 'Model S',
    year: 2012,
    price: 4931306619.35,
    type: 'EV',
  },
  {
    brand: 'GMC',
    model: 'Canyon',
    year: 2005,
    price: 9821148400.17,
    type: 'Combustion Engine',
  },
  {
    brand: 'BMW',
    model: 'X5 M',
    year: 2010,
    price: 8049538987.98,
    type: 'Combustion Engine',
  },
  {
    brand: 'Jeep',
    model: 'Cherokee',
    year: 1999,
    price: 7461052010.21,
    type: 'Combustion Engine',
  },
  {
    brand: 'Toyota',
    model: 'RAV4',
    year: 2007,
    price: 9236226288.09,
    type: 'EV',
  },
  {
    brand: 'Jaguar',
    model: 'XJ Series',
    year: 1992,
    price: 6508202324.59,
    type: 'Combustion Engine',
  },
  {
    brand: 'Chevrolet',
    model: 'Monte Carlo',
    year: 1998,
    price: 379389456.39,
    type: 'Hybrid',
  },
  {
    brand: 'Isuzu',
    model: 'Oasis',
    year: 1999,
    price: 7551329742.88,
    type: 'Hybrid',
  },
  {
    brand: 'Honda',
    model: 'CR-V',
    year: 1997,
    price: 8670594727.22,
    type: 'EV',
  },
  {
    brand: 'Chevrolet',
    model: 'Express 1500',
    year: 2011,
    price: 861659943.3,
    type: 'EV',
  },
  {
    brand: 'Ford',
    model: 'Flex',
    year: 2010,
    price: 7938373028.45,
    type: 'Combustion Engine',
  },
  {
    brand: 'Chevrolet',
    model: '1500',
    year: 1992,
    price: 4537900851.75,
    type: 'Hybrid',
  },
  {
    brand: 'Pontiac',
    model: 'Grand Prix',
    year: 1990,
    price: 3780841832.04,
    type: 'Combustion Engine',
  },
  {
    brand: 'Mercedes-Benz',
    model: 'E-Class',
    year: 2009,
    price: 7192229849.28,
    type: 'Hybrid',
  },
  {
    brand: 'Plymouth',
    model: 'Breeze',
    year: 1996,
    price: 1734552555.22,
    type: 'Hybrid',
  },
  {
    brand: 'GMC',
    model: 'Sonoma Club Coupe',
    year: 1995,
    price: 214712532.92,
    type: 'EV',
  },
  {
    brand: 'Lexus',
    model: 'IS-F',
    year: 2012,
    price: 3252449488.8,
    type: 'Hybrid',
  },
  {
    brand: 'Nissan',
    model: 'Quest',
    year: 2000,
    price: 9164057527.86,
    type: 'Hybrid',
  },
  {
    brand: 'Chevrolet',
    model: 'Suburban',
    year: 2010,
    price: 5070369087.98,
    type: 'EV',
  },
  {
    brand: 'Volvo',
    model: 'S40',
    year: 2004,
    price: 2666209744.19,
    type: 'Hybrid',
  },
  {
    brand: 'Mitsubishi',
    model: 'Eclipse',
    year: 1991,
    price: 5231601855.36,
    type: 'Combustion Engine',
  },
];

export default vehicles;