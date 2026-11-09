export type ParticipationMode = "presentiel" | "distanciel";
export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";
export type PaymentStatus = "unpaid" | "deposit" | "paid" | "refunded";
export type DayState = "available" | "partial" | "booked" | "unavailable";

export interface CommercialPackage {
  id: string;
  code: string;
  name: string;
  subtitle: string;
  priceFcfa: number;
  durationMinutes: number;
  durationLabel: string;
  sessionsCount: number;
  badge: string;
  featured: boolean;
  active: boolean;
  sortOrder: number;
  description: string;
  features: string[];
  promoBenefits: string[];
  modesAllowed: "both" | ParticipationMode;
}

export interface TimeSlotOption {
  startTime: string;
  endTime: string;
  durationMinutes: number;
  available: boolean;
  reason?: "booked" | "blocked" | "past";
}

export interface DayAvailability {
  date: string;
  state: DayState;
  totalSlots: number;
  availableSlots: number;
  bookedSlots: number;
  note?: string;
}

export interface MonthAvailabilityResponse {
  month: string; // YYYY-MM
  launchDate: string;
  packageId: string;
  durationMinutes: number;
  days: DayAvailability[];
}

export interface BookingCreateInput {
  // Participation
  participationMode: ParticipationMode;
  bookingDate: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  packageId: string;
  specialNeeds: string;

  // Informations personnelles
  firstName: string;
  lastName: string;
  phone: string;
  whatsapp: string;
  email: string;
  country: string;
  city: string;

  // Informations professionnelles
  companyName: string;
  sector: string;
  companyDescription: string;
  productsServices: string;
  physicalAddress: string;
  businessPhone: string;
  socialLinks: string;
  livePrepNotes: string;
}

export interface BookingRecord extends BookingCreateInput {
  id: number;
  reference: string;
  endTime: string;
  durationMinutes: number;
  packageName: string;
  amountFcfa: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  assignedAssistant: string;
  adminNotes: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationRecord {
  id: number;
  bookingId: number | null;
  bookingReference: string;
  recipientType: "admin" | "participant";
  recipientEmail: string;
  subject: string;
  summary: string;
  bodyText: string;
  deliveryStatus: "logged" | "sent" | "failed";
  isRead: boolean;
  createdAt: string;
}

export interface PlatformSettings {
  launchDate: string;
  openDays: number[]; // 0 = Dimanche ... 6 = Samedi
  slotTemplates: string[]; // ex: ["09:00", "11:00", "14:00", "16:00", "18:30"]
  studioName: string;
  studioAddress: string;
  adminEmail: string;
  whatsappNumber: string;
  bookingHorizonMonths: number;
  smtpConfigured?: boolean;
}

export interface DateOverrideRecord {
  date: string;
  status: "open" | "closed";
  customSlots: string[];
  note: string;
}

export interface BlockedSlotRecord {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
}

export interface PublicUpcomingLive {
  reference: string;
  participationMode: ParticipationMode;
  bookingDate: string;
  startTime: string;
  endTime: string;
  packageName: string;
  country: string;
  city: string;
  companyName: string;
  sector: string;
  productsServices: string;
  physicalAddress: string;
  businessPhone: string;
  socialLinks: string;
}

export interface DashboardStats {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  completedBookings: number;
  presentielCount: number;
  distancielCount: number;
  paidRevenueFcfa: number;
  expectedRevenueFcfa: number;
  unreadNotifications: number;
  byCountry: { country: string; count: number }[];
  bySector: { sector: string; count: number }[];
  byPackage: { packageName: string; count: number }[];
  upcomingLives: BookingRecord[];
}
