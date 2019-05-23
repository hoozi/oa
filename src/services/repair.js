import request from '../utils/request';
import { stringify } from 'qs';

export async function editRepair(data) {
  return request('/api/repair', {
    method: 'PUT',
    body: data
  });
}

export async function addRepair(data) {
  return request('/api/repair', {
    method: 'POST',
    body: data
  });
}

export async function queryRepair(params) {
  return request(`/api/repair/page?${stringify(params)}`)
}

export async function deleteRepair(id) {
  return request(`/api/repair?ids=${id}`, {
    method: 'DELETE'
  });
}


