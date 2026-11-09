import type {
  BlockedSlotRecord,
  BookingCreateInput,
  BookingRecord,
  CommercialPackage,
  DashboardStats,
  DateOverrideRecord,
  MonthAvailabilityResponse,
  NotificationRecord,
  PlatformSettings,
  PublicUpcomingLive,
  TimeSlotOption,
} from "@/types/booking";

export class ApiError extends Error {
  status: number;
  fields?: Record<string, string>;

  constructor(message: string, status: number, fields?: Record<string, string>) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    ...init,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(
      data.error || "Une erreur est survenue lors de la communication avec le serveur.",
      response.status,
      data.fields
    );
  }
  return data as T;
}

/* =========================================================== Public Client */
export async function fetchPublicConfig(): Promise<{
  settings: PlatformSettings;
  packages: CommercialPackage[];
  upcomingLives?: PublicUpcomingLive[];
}> {
  return requestJson("/api/public/config");
}

export async function fetchMonthAvailability(
  month: string,
  packageId: string
): Promise<MonthAvailabilityResponse> {
  const params = new URLSearchParams({ month, packageId });
  return requestJson(`/api/public/availability?${params.toString()}`);
}

export async function fetchDateSlots(
  date: string,
  packageId: string
): Promise<{
  date: string;
  packageId: string;
  durationMinutes: number;
  open: boolean;
  note?: string;
  slots: TimeSlotOption[];
}> {
  const params = new URLSearchParams({ date, packageId });
  return requestJson(`/api/public/slots?${params.toString()}`);
}

export async function submitPublicBooking(payload: BookingCreateInput): Promise<{
  booking: BookingRecord;
  confirmationText: string;
}> {
  return requestJson("/api/public/bookings", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function lookupPublicBooking(
  reference: string,
  contact: string
): Promise<{ booking: BookingRecord }> {
  return requestJson("/api/public/bookings/lookup", {
    method: "POST",
    body: JSON.stringify({ reference, contact }),
  });
}

/* ============================================================ Admin Client */
export async function fetchAdminSession(): Promise<{
  authenticated: boolean;
  email?: string;
}> {
  return requestJson("/api/admin/session");
}

export async function loginAdmin(
  email: string,
  password: string
): Promise<{ authenticated: boolean; email: string }> {
  return requestJson("/api/admin/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function logoutAdmin(): Promise<void> {
  await requestJson("/api/admin/logout", { method: "POST" });
}

export async function fetchAdminOverview(): Promise<{
  stats: DashboardStats;
  settings: PlatformSettings;
  packages: CommercialPackage[];
  calendar: {
    overrides: DateOverrideRecord[];
    blockedSlots: BlockedSlotRecord[];
  };
}> {
  return requestJson("/api/admin/overview");
}

export async function fetchAdminBookings(filters?: {
  status?: string;
  mode?: string;
  paymentStatus?: string;
  country?: string;
  search?: string;
}): Promise<{ bookings: BookingRecord[] }> {
  const params = new URLSearchParams();
  if (filters) {
    for (const [k, v] of Object.entries(filters)) {
      if (v) params.set(k, v);
    }
  }
  const qs = params.toString();
  return requestJson(`/api/admin/bookings${qs ? `?${qs}` : ""}`);
}

export async function patchAdminBooking(
  id: number,
  patch: Partial<BookingRecord>
): Promise<{ booking: BookingRecord; stats: DashboardStats }> {
  return requestJson(`/api/admin/bookings/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export async function saveAdminPackage(
  pkg: CommercialPackage
): Promise<{ package: CommercialPackage; packages: CommercialPackage[] }> {
  return requestJson(`/api/admin/packages/${pkg.id}`, {
    method: "PUT",
    body: JSON.stringify(pkg),
  });
}

export async function saveAdminSettings(
  settings: Partial<PlatformSettings>
): Promise<{ settings: PlatformSettings }> {
  return requestJson("/api/admin/settings", {
    method: "PUT",
    body: JSON.stringify(settings),
  });
}

export async function saveAdminDateOverride(payload: {
  date: string;
  status: "open" | "closed" | "default";
  customSlots?: string[];
  note?: string;
}): Promise<{ calendar: { overrides: DateOverrideRecord[]; blockedSlots: BlockedSlotRecord[] } }> {
  return requestJson("/api/admin/calendar/override", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function addAdminBlockedSlot(payload: {
  date: string;
  startTime: string;
  endTime: string;
  reason?: string;
}): Promise<{ calendar: { overrides: DateOverrideRecord[]; blockedSlots: BlockedSlotRecord[] } }> {
  return requestJson("/api/admin/calendar/block", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminBlockedSlot(
  id: number
): Promise<{ calendar: { overrides: DateOverrideRecord[]; blockedSlots: BlockedSlotRecord[] } }> {
  return requestJson(`/api/admin/calendar/block/${id}`, {
    method: "DELETE",
  });
}

export async function fetchAdminNotifications(): Promise<{
  notifications: NotificationRecord[];
  unreadCount: number;
}> {
  return requestJson("/api/admin/notifications");
}

export async function markAdminNotificationsRead(
  id: number | "all"
): Promise<{ notifications: NotificationRecord[]; unreadCount: number }> {
  return requestJson("/api/admin/notifications/read", {
    method: "POST",
    body: JSON.stringify({ id }),
  });
}

export async function changeAdminPassword(
  currentPassword: string,
  newPassword: string
): Promise<{ ok: boolean }> {
  return requestJson("/api/admin/password", {
    method: "POST",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export async function seedAdminDemoBookings(): Promise<{
  inserted: number;
  stats: DashboardStats;
  bookings: BookingRecord[];
  notifications: NotificationRecord[];
}> {
  return requestJson("/api/admin/demo/seed", { method: "POST" });
}

export async function clearAdminDemoBookings(): Promise<{
  deleted: number;
  stats: DashboardStats;
  bookings: BookingRecord[];
  notifications: NotificationRecord[];
}> {
  return requestJson("/api/admin/demo/clear", { method: "DELETE" });
}
