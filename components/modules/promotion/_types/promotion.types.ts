export type PromotionStatus = "active" | "inactive" | "scheduled" | "expired";
export type AdvertisementType = "audio" | "video" | "pdf";
export type TargetAudience = "all" | "wholesalers" | "retailers" | "customers";

export interface Wholesaler {
  id: string;
  name: string;
}

export interface Promotion {
  id: string;
  title: string;
  status: PromotionStatus;
  adType: AdvertisementType;
  wholesalerId: string;
  wholesalerName: string;
  shortDescription: string;
  mediaUrl: string; // This will be the link for audio, video or pdf
  bannerImage?: string;
  startDate?: string;
  endDate?: string;
  targetAudience: TargetAudience;
  priority: number;
  createdAt: string;
  updatedAt: string;
}
