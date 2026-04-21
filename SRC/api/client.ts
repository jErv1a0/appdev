import api from '../config/api';

async function request(path: string, options: RequestInit = {}) {
  const url = `${api.baseUrl}${path}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(url, { ...options, headers, credentials: 'include' });

  const text = await res.text();
  try {
    const json = text ? JSON.parse(text) : null;
    if (!res.ok) throw { status: res.status, body: json };
    return json;
  } catch (e) {
    if (e && e.status) throw e;
    // Non-JSON response
    if (!res.ok) throw { status: res.status, body: text };
    return text;
  }
}

export async function login(email: string, password: string) {
  return request('/api/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function getRoomListings() {
  return request('/api/room_listings');
}

export async function getRoomDetails(id: number) {
  return request(`/api/rooms/${id}`);
}

export async function createBooking(roomId: number, checkIn: string, checkOut: string) {
  return request('/api/bookings', {
    method: 'POST',
    body: JSON.stringify({ room_id: roomId, check_in: checkIn, check_out: checkOut }),
  });
}

export async function getMyBookings() {
  return request('/api/bookings');
}

export async function cancelBooking(id: number) {
  return request(`/api/bookings/${id}`, {
    method: 'DELETE',
  });
}

export default { request, login, getRoomListings, getRoomDetails, createBooking, getMyBookings, cancelBooking };
