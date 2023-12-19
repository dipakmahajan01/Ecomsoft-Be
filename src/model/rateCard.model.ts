import { boolean } from 'joi';
import mongoose from 'mongoose';

type TCommission = {
  min_item_val: number;
  max_item_val: number;
  percentage: number;
};

type TFixedFees = {
  min_item_val: number;
  max_item_val: number;
  fees: number;
};

type TCollectionFee = {
  min_item_val: number;
  max_item_val: number;
  prepaid: {
    type: 'percentage' | 'fixed';
    value: number;
  };
  postpaid: {
    type: 'percentage' | 'fixed';
    value: number;
  };
};

type TShippingFee = {
  min_weight: number;
  max_weight: number;
  fees_for_every: number;
  local: number;
  zonal: number;
  national: number;
};

export interface IRateCardModel {
  fsn_code: string;
  commission: {
    NO_FBF: [TCommission];
    FBF: [TCommission];
  };
  fixed_fee: {
    No_FBF: [TFixedFees];
    FBF: [TFixedFees];
  };
  collection_fee: TCollectionFee[];
  shipping_fee: {
    NO_FBF: {
      platinum: [TShippingFee];
      gold: [TShippingFee];
      silver: [TShippingFee];
      bronze: [TShippingFee];
      wood: [TShippingFee];
    };
    FBF: {
      platinum: [TShippingFee];
      gold: [TShippingFee];
      silver: [TShippingFee];
      bronze: [TShippingFee];
      wood: [TShippingFee];
    };
  };
  reverse_shipping_fee: {
    NO_FBF: [TShippingFee];
    FBF: [TShippingFee];
  };
  needs_to_add: boolean;
}

const CommissionSchema = new mongoose.Schema(
  {
    min_item_val: Number,
    max_item_val: Number,
    percentage: Number,
  },
  { _id: false },
);

const FixedFeesSchema = new mongoose.Schema(
  {
    min_item_val: Number,
    max_item_val: Number,
    fees: Number,
  },
  { _id: false },
);

const CollectionFeeSchema = new mongoose.Schema(
  {
    min_item_val: Number,
    max_item_val: Number,
    postpaid: {
      type: {
        type: String,
        required: true,
        enum: ['percentage', 'fixed'], // Adjust based on your requirements
      },
      value: {
        type: Number,
        required: true,
      },
    },
    prepaid: {
      type: {
        type: String,
        required: true,
        enum: ['percentage', 'fixed'], // Adjust based on your requirements
      },
      value: {
        type: Number,
        required: true,
      },
    },
  },
  { _id: false },
);

const ShippingFeeSchema = new mongoose.Schema(
  {
    min_weight: Number,
    max_weight: Number,
    fees_for_every: Number,
    local: Number,
    zonal: Number,
    national: Number,
  },
  { _id: false },
);

const RateCardSchema = new mongoose.Schema(
  {
    fsn_code: String,
    commission: {
      NON_FBF: [CommissionSchema],
      FBF: [CommissionSchema],
    },
    fixed_fees: {
      NON_FBF: [FixedFeesSchema],
      FBF: [FixedFeesSchema],
    },
    collection_fees: [CollectionFeeSchema],
    shipping_fee: {
      NON_FBF: {
        platinum: [ShippingFeeSchema],
        gold: [ShippingFeeSchema],
        silver: [ShippingFeeSchema],
        bronze: [ShippingFeeSchema],
        wood: [ShippingFeeSchema],
      },
      FBF: {
        platinum: [ShippingFeeSchema],
        gold: [ShippingFeeSchema],
        silver: [ShippingFeeSchema],
        bronze: [ShippingFeeSchema],
        wood: [ShippingFeeSchema],
      },
    },
    reverse_shipping_fee: {
      NON_FBF: [ShippingFeeSchema],
      FBF: [ShippingFeeSchema],
    },
    needs_to_add: { type: Boolean, default: false },
  },
  { timestamps: true },
);
const RateCard = mongoose.model<IRateCardModel>('rate_card', RateCardSchema);

export default RateCard;
