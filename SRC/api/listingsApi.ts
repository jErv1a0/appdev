import client from './client';

export interface Listing {
  id: number | string;
  place: string;
  location: string;
  price: string | number;
  imageUrl: string;
  availability: string;
  bookingDays: number;
}

function normalizeListing(item: any, index: number): Listing {
  return {
    id: item?.id ?? item?.room_id ?? index,
    place: item?.place ?? item?.name ?? item?.title ?? 'Untitled Listing',
    location: item?.location ?? item?.address ?? item?.city ?? 'Unknown Location',
    price: item?.price_per_night ?? item?.price ?? 0,
    imageUrl: item?.image_url ?? item?.image ?? `https://picsum.photos/400/30${index % 10}`,
    availability: item?.availability ?? item?.status ?? 'Available',
    bookingDays: item?.booking_days ?? item?.bookable_days ?? 30,
  };
}

export async function fetchListingsApi(): Promise<Listing[]> {
  const response = await client.getRoomListings();

  const rawListings = Array.isArray(response)
    ? response
    : response?.listings ?? response?.data ?? [];

  return rawListings.map((item: any, index: number) => normalizeListing(item, index));
}
