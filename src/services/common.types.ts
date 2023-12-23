export interface ITokenData {
  email: string;
  user_id: string;
  created_by: string;
}

export enum EShipmentType {
  Local = 'LOCAL',
  Zonal = 'ZONAL',
  National = 'NATIONAL',
  'N/A' = 'N/A',
}

export enum EShipmentZones {
  NORTH = 'NORTH',
  WEST = 'WEST',
  SOUTH = 'SOUTH',
  EAST = 'EAST',
  'N/A' = 'N/A',
}
