import { stringify } from 'qs';
import request from '../utils/request';

export async function queryRoom(param) {
  return request(`/api/room/unRentedlist/?${stringify(param)}`);
}

export async function queryRoomPage(param) {
  return request(`/api/room/list/?${stringify(param)}`);
}

export async function addRoom(params) {
  return request('/api/room', {
    method: 'POST',
    body: params
  })
}


export async function editRoom(params) {
  return request('/api/room', {
    method: 'PUT',
    body: params
  })
}

export async function deleteRoom(params) {
  return request(`/api/room/${params}`, {
    method: 'DELETE'
  })
}

export async function queryRoomInfo(param) {
  return request(`/api/room/info?${stringify(param)}`);
}

export async function updateBill(param) {
  return request(`/api/getBillByUserId?${stringify(param)}`);
}

