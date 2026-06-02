import { API_BASE_URL } from '../config/api';

let accessToken: string | null = null;
const REQUEST_TIMEOUT_MS = 15000;

export function setAccessToken(token: string | null) {
  accessToken = token || null;
}

export function setAuthToken(token: string | null) {
  setAccessToken(token);
}

function headers(extra: Record<string, string> = {}) {
  return {
    // Prefer JSON-LD responses (Hydra) but accept JSON as fallback
    Accept: 'application/ld+json, application/json',
    ...extra,
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };
}

async function request(path: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${path}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    console.log('API request start', {
      url,
      method: options.method || 'GET',
      credentials: 'include',
      headers: headers((options.headers as Record<string, string>) || {}),
    });

    response = await fetch(url, {
      ...options,
      credentials: 'include',
      signal: controller.signal,
      headers: headers((options.headers as Record<string, string>) || {}),
    });

    if (typeof response.headers?.forEach === 'function') {
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value: string, name: string) => {
        responseHeaders[name] = value;
      });
      console.log('API response headers', { url, status: response.status, headers: responseHeaders });
    } else {
      console.log('API response received', { url, status: response.status });
    }
  } catch (error: any) {
    const isTimeout = error?.name === 'AbortError';
    const message = isTimeout
      ? `Request timed out after ${REQUEST_TIMEOUT_MS / 1000}s`
      : error?.message || 'Network request failed';
    throw new Error(`${message} (${url})`);
  } finally {
    clearTimeout(timeoutId);
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    console.log('API request failed', { url, status: response.status, data });
    const apiError: Error & { status?: number; body?: unknown; url?: string } = new Error(
      data.error || data.message || `Request failed: ${response.status}`,
    );
    apiError.status = response.status;
    apiError.body = data;
    apiError.url = url;
    throw apiError;
  }
  return data;
}

export async function login(email: string, password: string) {
  const data = await request('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  setAccessToken(data.access_token ?? data.token ?? '');
  return data;
}

export function getProfile() {
  return request('/api/user/profile');
}

export function updateProfile(payload: any) {
  return request('/api/user/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function getRooms() {
  try {
    return await request('/api/room_listings');
  } catch (error: any) {
    if (error?.status === 404) {
      return request('/api/rooms');
    }
    throw error;
  }

}

export function getBookings() {
  return request('/api/bookings');
}

export function createBooking(roomId: number, startDate: string, endDate: string, guests?: number) {
  const body: Record<string, unknown> = {
    roomId,
    room_id: roomId,
    startDate,
    check_in: startDate,
    endDate,
    check_out: endDate,
  };

  if (typeof guests === 'number') {
    body.guests = guests;
  }

  return request('/api/bookings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

export async function updateBooking(bookingId: number | string, roomId: number | string, startDate: string, endDate: string, guests?: number) {
  const body: Record<string, unknown> = {
    roomId,
    room_id: roomId,
    startDate,
    check_in: startDate,
    endDate,
    check_out: endDate,
  };

  if (typeof guests === 'number') {
    body.guests = guests;
  }

  try {
    return await request(`/api/bookings/${bookingId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  } catch (err: any) {
    // If PATCH not allowed (405) or endpoint missing (404), try delete+create as a fallback
    if (err?.status === 405 || err?.status === 404) {
      try {
        await request(`/api/bookings/${bookingId}`, { method: 'DELETE' });
      } catch (innerErr: any) {
        // If DELETE returns not found, ignore and proceed; otherwise rethrow original error
        if (innerErr?.status !== 404) {
          throw err;
        }
      }
      // Create a new booking regardless of delete success or missing resource
      return await createBooking(Number(roomId) || 0, String(startDate), String(endDate), guests);
    }
    throw err;
  }
}

export function logout() {
  return request('/api/logout', { method: 'POST' }).finally(() => {
    setAccessToken('');
  });
}

export async function getRoomListings() {
  return getRooms();
}

export async function getRoomDetails(id: number) {
  return request(`/api/rooms/${id}`);
}

export async function getRoomImages(id: number) {
  const response = await getRoomDetails(id);
  let roomData = response;
  if (response?.data) {
    roomData = response.data;
  }
  if (response?.room) {
    roomData = response.room;
  }
  if (Array.isArray(roomData?.images)) {
    return roomData.images.map((image: any) => String(image));
  }
  if (Array.isArray(roomData?.image_urls)) {
    return roomData.image_urls.map((image: any) => String(image));
  }
  if (Array.isArray(roomData?.photos)) {
    return roomData.photos.map((image: any) => String(image));
  }
  if (roomData?.image) {
    return [String(roomData.image)];
  }
  if (roomData?.imageUrl) {
    return [String(roomData.imageUrl)];
  }
  return [];
}

export async function getMyBookings() {
  return request('/api/bookings/my');
}

export async function cancelBooking(id: number) {
  return request(`/api/bookings/${id}`, {
    method: 'DELETE',
  });
}

export default {
  request,
  login,
  getProfile,
  getRooms,
  getBookings,
  createBooking,
  updateBooking,
  logout,
  getRoomListings,
  getRoomDetails,
  getMyBookings,
  cancelBooking,
  setAccessToken,
  setAuthToken,
};
