export const detailDocuments = {
  id: 1,
  name: 'Example document',
  slug: 'example-document',
  job: 'this is job of example document',
  location: 'this is location of example document',
  base: 'this is base of example document',
  sheet: [
    {
      workSectionName: 'this is first work section name of example document',
      noWorkSection: 'I',
      workSectionItems: [
        {
          jobDescription: 'This is job description items of example document',
          volume: 1, // can increase/decrease
          pricePerUnit: {
            materialPrice: 10000,
            feePrice: 50000,
          },
          totalPrice: {
            //this price get from pricePerUnit multiple by volume
            materialPrice: 10000,
            feePrice: 5000,
          },
          information: 'AHS 2024, Sourcing Harga',
        },
        {
          jobDescription: 'This is job description items of example document',
          volume: 2, // can increase/decrease
          pricePerUnit: {
            materialPrice: 20000,
            feePrice: 10000,
          },
          totalPrice: {
            //this price get from pricePerUnit multiple by volume
            materialPrice: 10000,
            feePrice: 50000,
          },
          information: 'AHS 2024, Sourcing Harga',
        },
      ],
      totalPrice: {
        //this price get from totaling all totalPrice from workSectionItems
        materialPrice: 30000,
        feePrice: 150000,
      },
    },
    {
      workSectionName: 'this is first work section name of example document',
      noWorkSection: 'II',
      workSectionItems: [
        {
          jobDescription: 'This is job description items of example document',
          volume: 1, // can increase/decrease
          pricePerUnit: {
            materialPrice: 10000,
            feePrice: 50000,
          },
          totalPrice: {
            //this price get from pricePerUnit multiple by volume
            materialPrice: 10000,
            feePrice: 5000,
          },
          information: 'AHS 2024, Sourcing Harga',
        },
      ],
      totalPrice: {
        //this price get from totaling all totalPrice from workSectionItems
        materialPrice: 10000,
        feePrice: 5000,
      },
    },
  ],
};
