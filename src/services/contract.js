import { stringify } from 'qs';
import request from '../utils/request';

export async function queryContract(params) {
  return request(`/api/contract?${stringify(params)}`);
}

export async function queryContractById(params) {
  return request(`/api/contract/${params}`);
}

export async function addContract(params) {
  return request('/api/contract', {
    method: 'POST',
    body: params
  })
}

export async function editContract(params) {
  return request('/api/contract', {
    method: 'PUT',
    body: params
  })
}

export async function throwContract(params) {
  return request(`/api/contract/?${params}`, {
    method: 'DELETE'
  })
}

export async function unThrowContract(params) {
  return request(`/api/contract/cancelDel`, {
    method: 'PUT',
    body: params
  });
}

export function queryRoomByContract(name) {
  return async params => request(`/api/contract/${name}?${stringify(params)}`); 
}

export async function addEnergy(params) {
  return request(`/api/contract/calcUsedAndFee`, {
    method: 'POST',
    body: params
  });
}