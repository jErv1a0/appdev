import client from './client';
import { API_BASE_URL } from '../config/api';

export interface Listing {
  id: number | string;
  place: string;
  location: string;
  price: string | number;
  imageUrl: string;
  images: string[];
  availability: string;
  bookingDays: number;
  description?: string;
  amenities?: string[];
  bedrooms?: number;
  guests?: number;
  category?: string;
  isBlocked?: boolean;
  roomType?: string;
  roomTitle?: string;
  fullDescription?: string;
}

function normalizeImageUrl(url: any): string {
  const value = String(url ?? '').trim();
  if (!value) {
    return '';
  }
  if (value.startsWith('http')) {
    return value;
  }
  return `${API_BASE_URL}${value.startsWith('/') ? '' : '/'}${value}`;
}

function generatePlaceholderImage(roomId: number, category: string): string {
  // Generate a placeholder image URL based on room category or ID
  // Using placeholder service or a deterministic image based on category
  const categories: Record<string, string> = {
    'Studio Deluxe': 'https://images.unsplash.com/photo-1631049307038-da5ec5d128c2?w=400&h=300&fit=crop',
    'Family Apartment': 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop',
    'Luxury Suite': 'https://images.unsplash.com/photo-1540932239986-310128078ceb?w=400&h=300&fit=crop',
  };
  
  return categories[category] || 'https://images.unsplash.com/photo-1564501049351-8ad53552fd15?w=400&h=300&fit=crop';
}

export function normalizeListing(item: any, index: number): Listing {
  return {
    id: item?.id ?? index,
    place: `Room ${item?.number ?? ''}`.trim(),
    location: item?.location ?? 'Unknown Location',
    // Try many common locations for a price field and coerce to number
    price: ((): number => {
      const candidates = [
        item?.pricePerNight,
        item?.price_per_night,
        item?.price,
        item?.nightlyRate,
        item?.price_per_night_local,
        item?.attributes?.price,
        item?.attributes?.price_per_night,
        item?.data?.price,
        item?.data?.attributes?.price,
        item?.pricing?.price,
      ];
      for (const c of candidates) {
        if (c !== undefined && c !== null && c !== '') {
          const n = Number(String(c));
          if (!Number.isNaN(n)) return n;
        }
      }
      return 0;
    })(),
    imageUrl: item?.imageUrl 
      ?? item?.imagePath 
      ?? item?.image_url 
      ?? item?.image 
      ?? `https://picsum.photos/seed/${item?.id ?? index}/400/300`,
    images: [],
    availability: item?.isAvailable === false ? 'Unavailable' : 'Available',
    bookingDays: 30,
    description: item?.description ?? '',
    amenities: Array.isArray(item?.amenities) ? item.amenities : [],
    bedrooms: item?.bedrooms ?? 1,
    guests: item?.capacity ?? item?.max_guests ?? 2,
    category: item?.category ?? '',
    isBlocked: item?.isBlocked ?? false,
    roomTitle: item?.roomTitle ?? item?.name ?? item?.title ?? `Room ${item?.number ?? ''}`.trim(),
    fullDescription: item?.fullDescription ?? item?.description ?? '',
  };
}

function extractCollection(response: any) {
  // Format: { success: true, data: [...] }
  if (Array.isArray(response?.data)) {
    return response.data;
  }
  // Format: { member: [...] } (API Platform)
  if (Array.isArray(response?.['hydra:member'])) {
    return response['hydra:member'];
  }
  if (Array.isArray(response?.member)) {
    return response.member;
  }
  // Format: { listings: [...] }
  if (Array.isArray(response?.listings)) {
    return response.listings;
  }
  if (Array.isArray(response?.rooms)) {
    return response.rooms;
  }
  if (Array.isArray(response?.items)) {
    return response.items;
  }
  // Format: direct array
  if (Array.isArray(response)) {
    return response;
  }
  return [];
}

function mergeListings(...collections: any[][]) {
  const merged = new Map<string, Listing>();

  collections.flat().forEach((item, index) => {
    const normalized = normalizeListing(item, index);
    merged.set(String(normalized.id), normalized);
  });

  return Array.from(merged.values());
}

export async function fetchListingsApi(): Promise<Listing[]> {
  const response = await client.getRoomListings();
  const collection = extractCollection(response);
  console.log('=== TOTAL ROOMS:', collection.length);
  console.log('=== FIRST ROOM IMAGE URL:', collection?.[0]?.imageUrl);
  console.log('=== NORMALIZED IMAGE URL:', normalizeListing(collection?.[0], 0).imageUrl);
  return mergeListings(collection);
}

export async function fetchRoomDetailsApi(roomId: number | string): Promise<Listing> {
  try {
    const response = await client.getRoomDetails(Number(roomId));

    // Handle different response formats
    let roomData = response;
    if (response?.data) {
      roomData = response.data;
    }
    if (response?.room) {
      roomData = response.room;
    }

    return normalizeListing(roomData, 0);
  } catch (error) {
    console.log('Error fetching room details:', error);
    throw error;
  }
}

export async function fetchRoomImagesApi(roomId: number | string): Promise<string[]> {
  const listing = await fetchRoomDetailsApi(roomId);
  return listing.images.length > 0 ? listing.images : listing.imageUrl ? [listing.imageUrl] : [];
}
