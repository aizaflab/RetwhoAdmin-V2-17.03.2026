export type ShopType = "wholesaler" | "retailer" | "restaurant" | "inactive";

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface Shop {
  id: string;
  createdBy: string;
  type: ShopType;
  companyName: string;
  dbaName: string;
  accountId: string;
  phone: string;
  email: string;
  fein: string;
  resaleNumber: string;
  tobaccoLicense: string;
  idNumber: string;
  address: Address;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}
