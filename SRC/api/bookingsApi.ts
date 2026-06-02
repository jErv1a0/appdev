import client from './client';

export interface Booking {
  id: number | string;
  roomId: number | string | null;
  title: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  status: string;
  nights?: number;
  nightlyRate?: number;
  room?: {
    id?: number | string;
    title?: string;
  };
}

function extractCollection(response: any) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.bookings)) {
    return response.bookings;
  }

  if (Array.isArray(response?.items)) {
    return response.items;
  }

  return [];
}

function normalizeBooking(item: any, index: number): Booking {
  const room = item?.room ?? {};
  const rawCheckIn =
    item?.check_in ??
    item?.start_date ??
    item?.from ??
    item?.startDate ??
    item?.start ??
    '';
  const rawCheckOut =
    item?.check_out ??
    item?.end_date ??
    item?.to ??
    item?.endDate ??
    item?.end ??
    '';

  const parseBookingDate = (value: any) => {
    const date = new Date(String(value));
    return Number.isNaN(date.valueOf()) ? null : date;
  };

  const normalizeAmount = (value: any): number => {
    if (value === null || value === undefined) {
      return 0;
    }
    const raw = String(value).trim();
    const cleaned = raw.replace(/[^0-9.-]+/g, '');
    const amount = Number(cleaned);
    return Number.isFinite(amount) ? amount : 0;
  };

  const checkInDate = parseBookingDate(rawCheckIn);
  const checkOutDate = parseBookingDate(rawCheckOut);
  const nights =
    checkInDate && checkOutDate && checkOutDate > checkInDate
      ? Math.round((checkOutDate.valueOf() - checkInDate.valueOf()) / (1000 * 60 * 60 * 24))
      : 0;

  const totalPriceRaw =
    item?.total_price ??
    item?.totalPrice ??
    item?.amount ??
    item?.total_amount ??
    item?.booking_price ??
    item?.amount_paid ??
    item?.subtotal ??
    item?.room?.total_price ??
    item?.room?.amount ??
    item?.room?.price ??
    item?.price ??
    0;

  const nightlyRateRaw =
    item?.price_per_night ??
    item?.nightly_rate ??
    item?.rate_per_night ??
    item?.room?.price_per_night ??
    item?.room?.pricePerNight ??
    item?.room?.nightly_rate ??
    item?.room?.nightlyRate ??
    item?.room?.price ??
    item?.price ??
    0;

  const parsedTotalPrice = normalizeAmount(totalPriceRaw);
  const nightlyRate = normalizeAmount(nightlyRateRaw);
  const computedTotalPrice =
    parsedTotalPrice > 0
      ? parsedTotalPrice
      : nights > 0 && nightlyRate > 0
      ? nights * nightlyRate
      : normalizeAmount(item?.room?.price) || 0;

  return {
    id: item?.id ?? item?.booking_id ?? index,
    roomId: item?.room_id ?? room?.id ?? item?.roomId ?? null,
    title:
      item?.title ??
      room?.title ??
      item?.room_name ??
      item?.name ??
      room?.name ??
      item?.room?.name ??
      'Booked stay',
    checkIn: rawCheckIn,
    checkOut: rawCheckOut,
    totalPrice: computedTotalPrice,
    nights,
    nightlyRate,
    status: item?.status ?? item?.state ?? item?.booking_status ?? 'confirmed',
    room: {
      id: room?.id ?? item?.room_id ?? item?.roomId ?? null,
      title: room?.title ?? room?.name ?? item?.room_name ?? item?.name,
    },
  };
}

export async function fetchBookingsApi(): Promise<Booking[]> {
  const response = await client.getMyBookings();
  return extractCollection(response).map((item: any, index: number) => normalizeBooking(item, index));
}

export async function fetchAllBookingsApi(): Promise<Booking[]> {
  const response = await client.getBookings();
  return extractCollection(response).map((item: any, index: number) => normalizeBooking(item, index));
}