import { stringify } from 'qs';
import request from '../utils/request';

export async function queryFloor(id) {
  return request(`/api/floor/list/${id}`);
}

export async function queryFloorById(id) {
  return request(`/api/floor/${id}`);
}

export async function addFloor(params) {
  return request('/api/floor', {
    method: 'POST',
    body: params
  })
}

export async function editFloor(params) {
  return request('/api/floor', {
    method: 'PUT',
    body: params
  })
}

export async function deleteFloor(params) {
  return request(`/api/floor/${params}`, {
    method: 'DELETE'
  })
}
