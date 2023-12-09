interface PlatformFeeData {
  response: {
    [seller: string]: {
      [fulfillmentProfile: string]: {
        [range: string]: {
          columns: {
            rate: {
              value: number;
            };
          };
          attributes: Record<string, any>;
        };
      };
    };
  };
  multiplier: number;
  fee_name: string;
}

export function extractCommissionFees(data: PlatformFeeData) {
  const result: { [fulfillmentProfileKey: string]: any[] } = {};
  const sellerKey = Object.keys(data.response)[0]; // Assuming there is only one seller key
  Object.keys(data.response[sellerKey]).forEach((fulfillmentProfileKey) => {
    const commissionFees = data.response[sellerKey][fulfillmentProfileKey];

    result[fulfillmentProfileKey] = Object.entries(commissionFees).map(([range, details]) => ({
      min_item_val: Number(range.split('-')[0]),
      max_item_val: Number(range.split('-')[1] || Infinity),
      percentage: details.columns.rate.value,
    }));
  });

  return result;
}

interface CollectionFeeData {
  response: {
    [seller: string]: {
      [range: string]: {
        columns: {
          postpaid: {
            type: string;
            value: number;
          };
          prepaid: {
            type: string;
            value: number;
          };
        };
        attributes: Record<string, any>;
      };
    };
  };
  multiplier: number;
  fee_name: string;
}

export function extractCollectionFees(data: CollectionFeeData) {
  const sellerKey = Object.keys(data.response)[0];

  const collectionFees = data.response[sellerKey];

  return Object.entries(collectionFees).map(([range, details]) => ({
    min_item_val: Number(range.split('-')[0]),
    max_item_val: Number(range.split('-')[1] || Infinity),
    postpaid: {
      type: details.columns.postpaid.type,
      value: details.columns.postpaid.value,
    },
    prepaid: {
      type: details.columns.prepaid.type,
      value: details.columns.prepaid.value,
    },
  }));
}

interface FixedFeeData {
  response: {
    [seller: string]: {
      [fulfillmentProfile: string]: {
        [range: string]: {
          columns: {
            rate: {
              value: number;
            };
          };
          attributes: Record<string, any>;
        };
      };
    };
  };
  multiplier: number;
  fee_name: string;
}

// Function to extract fixed fees data
export function extractFixedFees(fixedFeeData: FixedFeeData) {
  const sellerKey = Object.keys(fixedFeeData.response)[0];
  const result: { [fulfillmentProfileKey: string]: any[] } = {};
  Object.keys(fixedFeeData.response[sellerKey]).forEach((fulfillmentProfileKey) => {
    const fixedFees = fixedFeeData.response[sellerKey][fulfillmentProfileKey];
    const fees = Object.entries(fixedFees).map(([range, details]) => ({
      min_item_val: Number(range.split('-')[0]),
      max_item_val: Number(range.split('-')[1] || Infinity),
      fees: details.columns.rate.value,
    }));
    result[fulfillmentProfileKey] = fees;
  });

  return result;
}

interface ShippingFeeData {
  response: {
    [seller: string]: {
      [fulfillmentProfile: string]: {
        [range: string]: {
          columns: {
            local: {
              value: number;
            };
            zonal: {
              value: number;
            };
            national: {
              value: number;
            };
          };
          attributes: {
            constant: number;
          };
        };
      };
    };
  };
  multiplier: number;
  fee_name: string;
}

type TShippingFee = {
  min_weight: number;
  max_weight: number;
  fees_for_every: number;
  local: number;
  zonal: number;
  national: number;
};

// Function to extract shipping fees data
export function extractShippingFees(shippingFeeData: ShippingFeeData): {
  [fulfillmentProfileKey: string]: { [badge: string]: TShippingFee[] };
} {
  const result: { [fulfillmentProfileKey: string]: { [badge: string]: TShippingFee[] } } = {};
  Object.keys(shippingFeeData.response).forEach((badge: any) => {
    Object.keys(shippingFeeData.response[badge]).forEach((fulfillmentProfileKey) => {
      const shippingFees: TShippingFee[] = Object.entries(shippingFeeData.response[badge][fulfillmentProfileKey]).map(
        ([range, details]) => ({
          min_weight: parseFloat(range.split('-')[0]),
          max_weight: parseFloat(range.split('-')[1] || 'Infinity'),
          fees_for_every: details.attributes.constant,
          local: details.columns.local.value,
          zonal: details.columns.zonal.value,
          national: details.columns.national.value,
        }),
      );
      if (result[fulfillmentProfileKey]) {
        result[fulfillmentProfileKey][badge] = shippingFees;
      } else {
        result[fulfillmentProfileKey] = { [badge]: shippingFees };
      }
    });
  });
  return result;
}

export function extractReverseShippingFees(shippingFeeData: ShippingFeeData): TShippingFee[] {
  const badge = Object.keys(shippingFeeData.response)[0];
  const fulfillmentProfile = shippingFeeData.response[badge][Object.keys(shippingFeeData.response[badge])[0]];

  const shippingFees: TShippingFee[] = Object.entries(fulfillmentProfile).map(([range, details]) => ({
    min_weight: parseFloat(range.split('-')[0]),
    max_weight: parseFloat(range.split('-')[1] || 'Infinity'),
    fees_for_every: details.attributes.constant,
    local: details.columns.local.value,
    zonal: details.columns.zonal.value,
    national: details.columns.national.value,
  }));

  return shippingFees;
}

export function mergeObjects(obj1: Record<string, any>, obj2: Record<string, any>): void {
  for (const key in obj2) {
    if (key in obj2) {
      if (key in obj1 && typeof obj1[key] === 'object' && typeof obj2[key] === 'object') {
        mergeObjects(obj1[key], obj2[key]);
      } else if (obj1[key] !== obj2[key]) {
        // eslint-disable-next-line no-param-reassign
        obj1[key] = obj2[key];
      }
    }
  }
}

// export async function returnTheRateCardData(fnsCode) {
//   function mergeObjects(obj1, obj2) {
//     for (const key in obj2) {
//       if (key in obj2) {
//         if (key in obj1 && typeof obj1[key] === 'object' && typeof obj2[key] === 'object') {
//           obj1[key] = mergeObjects(obj1[key], obj2[key]);
//         } else if (obj1[key] !== obj2[key]) {
//           obj1[key] = obj2[key];
//         }
//       }
//     }
//     return obj1;
//   }

//   function getFormattedDate() {
//     const today = new Date();
//     const year = today.getFullYear();
//     const month = String(today.getMonth() + 1).padStart(2, '0');
//     const day = String(today.getDate()).padStart(2, '0');
//     return `${year}-${month}-${day}`;
//   }

//   const returnUrl = (fsnCode, FType, badge, isShipping = false) => {
//     return `https://seller.flipkart.com/napi/rate-card/fetchRateCardFees?service_profile=${FType}&date=${getFormattedDate()}&fsn=${fsnCode}&partner_context=flipkart&is_seller_dashboard=true&darwin_tier=${badge}&shipping=${isShipping}&sellerId=bbce0103039547c2`;
//   };

//   const badge = ['wood', 'bronze', 'silver', 'gold', 'platinum'];
//   const fulfillmentTypes = ['NON_FBF', 'FBF'];

//   const data = { NON_FBF: {}, FBF: [] };

//   let wait = true;
//   for (let fulfillmentType of fulfillmentTypes) {
//     for (let [index, bdg] of Object.entries(badge)) {
//       const rateCardData = await fetch(returnUrl(fnsCode, fulfillmentType, bdg, index != 0)).then((res) => res.json());
//       console.log(index != 0, rateCardData);
//       if (index == 0) {
//         data[fulfillmentType] = rateCardData;
//       } else {
//         data[fulfillmentType].shippingFee.response[bdg] = rateCardData.shippingFee.response[bdg];
//       }
//     }
//     if (wait) {
//       await new Promise((resolve) => {
//         setTimeout(() => {
//           resolve();
//         }, 60000);
//       });
//       wait = false;
//     }
//   }

//   const result = mergeObjects(data.NON_FBF, data.FBF);

//   await fetch('localhost:3000/api/internal/rateCard', { method: 'POST', body: JSON.stringify({ fnsCode }) }).then(
//     (res) => res.json(),
//   );
//   return result;
// }
