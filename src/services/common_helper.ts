import RateCard from '../model/rateCard.model';

export const fetchAndCacheIfNeeded = async (cache: any, fsnCode: string) => {
  if (!cache.has(fsnCode)) {
    const rateCard = await RateCard.findOne({ fsn_code: fsnCode });
    if (!rateCard) {
      await RateCard.create({
        fsn_code: fsnCode,
        needs_to_add: true,
      });
      return null;
    }
    cache.set(fsnCode, rateCard);
  }

  return cache.get(fsnCode);
};

const getApplicableRate = (price: number, table: any[]) => {
  return table.find((row) => row.max_item_val >= price && row.min_item_val <= price);
};

const returnPercentageOf = (val, percentage) => {
  return (val * percentage) / 100;
};

export const calculateCommission = (customerPrice: number, commissionTable: any) => {
  const row = getApplicableRate(customerPrice, commissionTable);
  const commission = returnPercentageOf(customerPrice, row.percentage);
  return commission;
};
