import { Promotion, Wholesaler } from "../_types/promotion.types";

export const MOCK_WHOLESALERS: Wholesaler[] = [
  { id: "ws_1", name: "Global Supply Co." },
  { id: "ws_2", name: "Prime Distribution" },
  { id: "ws_3", name: "Elite Wholesalers" },
  { id: "ws_4", name: "Modern Logistics" },
  { id: "ws_5", name: "Superior Trade Ltd." },
];

export const MOCK_PROMOTIONS: Promotion[] = [
  {
    id: "prm_1",
    title: "Summer Sales Extravaganza",
    status: "active",
    adType: "video",
    wholesalerId: "ws_1",
    wholesalerName: "Global Supply Co.",
    shortDescription:
      "Get up to 50% off on all summer collections. Premium quality guaranteed.",
    mediaUrl:
      "https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4",
    bannerImage:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop",
    startDate: "2026-04-01T00:00:00.000Z",
    endDate: "2026-04-30T23:59:59.000Z",
    targetAudience: "all",
    priority: 1,
    createdAt: "2026-03-20T10:00:00.000Z",
    updatedAt: "2026-03-20T10:00:00.000Z",
  },
  {
    id: "prm_2",
    title: "New Product Launch Audio Guide",
    status: "active",
    adType: "audio",
    wholesalerId: "ws_2",
    wholesalerName: "Prime Distribution",
    shortDescription:
      "Listen to our comprehensive guide on the new product line launch for wholesalers.",
    mediaUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    bannerImage:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2070&auto=format&fit=crop",
    startDate: "2026-03-25T00:00:00.000Z",
    endDate: "2026-05-25T23:59:59.000Z",
    targetAudience: "wholesalers",
    priority: 2,
    createdAt: "2026-03-22T14:30:00.000Z",
    updatedAt: "2026-03-22T14:30:00.000Z",
  },
  {
    id: "prm_3",
    title: "Vendor Agreement & Terms 2026",
    status: "active",
    adType: "pdf",
    wholesalerId: "ws_3",
    wholesalerName: "Elite Wholesalers",
    shortDescription:
      "Official documentation for vendor agreement and terms for the upcoming fiscal year.",
    mediaUrl: "https://www.africau.edu/images/default/sample.pdf",
    bannerImage:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=2070&auto=format&fit=crop",
    startDate: "2026-01-01T00:00:00.000Z",
    endDate: "2026-12-31T23:59:59.000Z",
    targetAudience: "retailers",
    priority: 5,
    createdAt: "2026-01-02T09:15:00.000Z",
    updatedAt: "2026-01-02T09:15:00.000Z",
  },
  {
    id: "prm_4",
    title: "Winter Clearance Sale",
    status: "expired",
    adType: "video",
    wholesalerId: "ws_4",
    wholesalerName: "Modern Logistics",
    shortDescription:
      "Final call for winter clearance inventory. Limited stock available.",
    mediaUrl:
      "https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4",
    bannerImage:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop",
    startDate: "2025-12-01T00:00:00.000Z",
    endDate: "2026-02-28T23:59:59.000Z",
    targetAudience: "customers",
    priority: 3,
    createdAt: "2025-11-15T11:45:00.000Z",
    updatedAt: "2025-11-15T11:45:00.000Z",
  },
  {
    id: "prm_5",
    title: "Upcoming Festival Promotion",
    status: "scheduled",
    adType: "video",
    wholesalerId: "ws_5",
    wholesalerName: "Superior Trade Ltd.",
    shortDescription:
      "Prepare for the upcoming festival with our exclusive collections. Pre-order now.",
    mediaUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    bannerImage:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2070&auto=format&fit=crop",
    startDate: "2026-04-10T00:00:00.000Z",
    endDate: "2026-04-20T23:59:59.000Z",
    targetAudience: "all",
    priority: 1,
    createdAt: "2026-03-28T16:00:00.000Z",
    updatedAt: "2026-03-28T16:00:00.000Z",
  },
  {
    id: "prm_1",
    title: "Summer Sales Extravaganza",
    status: "active",
    adType: "video",
    wholesalerId: "ws_1",
    wholesalerName: "Global Supply Co.",
    shortDescription:
      "Get up to 50% off on all summer collections. Premium quality guaranteed.",
    mediaUrl:
      "https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4",
    bannerImage:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop",
    startDate: "2026-04-01T00:00:00.000Z",
    endDate: "2026-04-30T23:59:59.000Z",
    targetAudience: "all",
    priority: 1,
    createdAt: "2026-03-20T10:00:00.000Z",
    updatedAt: "2026-03-20T10:00:00.000Z",
  },
  {
    id: "prm_3",
    title: "Vendor Agreement & Terms 2026",
    status: "active",
    adType: "pdf",
    wholesalerId: "ws_3",
    wholesalerName: "Elite Wholesalers",
    shortDescription:
      "Official documentation for vendor agreement and terms for the upcoming fiscal year.",
    mediaUrl: "https://www.africau.edu/images/default/sample.pdf",
    bannerImage:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=2070&auto=format&fit=crop",
    startDate: "2026-01-01T00:00:00.000Z",
    endDate: "2026-12-31T23:59:59.000Z",
    targetAudience: "retailers",
    priority: 5,
    createdAt: "2026-01-02T09:15:00.000Z",
    updatedAt: "2026-01-02T09:15:00.000Z",
  },
];
