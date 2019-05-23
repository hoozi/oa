import { stringify } from 'qs';
import request from '../utils/request';

// 水
export async function queryOfficeA(param) {
  return request(`/api/water/office?${stringify(param)}`);
}

export async function enterOfficeA(params) {
  return request('/api/water/office/batchAdd', {
    method: 'POST',
    body: params
  })
}

export async function queryOfficePublic(param) {
  return request(`/api/water/office/public?${stringify(param)}`);
}

export async function enterOfficePublic(params) {
  return request('/api/water/office/public', {
    method: 'POST',
    body: params
  })
}

export async function queryOfficeBusiness(param) {
  return request(`/api/water/office/public?${stringify(param)}`);
}

export async function enterOfficeBusiness(params) {
  return request('/api/water/office/public', {
    method: 'POST',
    body: params
  })
}

export async function queryWare(param) {
  return request(`/api/water/ware?${stringify(param)}`);
}

export async function enterWare(params) {
  return request('/api/water/ware', {
    method: 'POST',
    body: params
  })
}

export async function queryWarePublic(param) {
  return request(`/api/water/ware/public?${stringify(param)}`);
}

export async function enterWarePublic(params) {
  return request('/api/water/ware/public', {
    method: 'POST',
    body: params
  })
}

export async function queryPhase2(param) {
  return request(`/api/water/phase?${stringify(param)}`);
}

export async function enterPhase2(params) {
  return request('/api/water/phase', {
    method: 'POST',
    body: params
  })
}

export async function queryWaterMeter(param) {
  return request(`/api/water/set?${stringify(param)}`);
}

export async function queryWaterRoom(param) {
  return request(`/api/water/ware/list?${stringify(param)}`);
}

export async function enterWaterMeter(param) {
  return request('/api/water/set', {
    method: 'POST',
    body: param
  })
}

export async function editRoomBatch(params) {
  return request('/api/room/batchUpdate', {
    method: 'PUT',
    body: params
  })
}

//电
export async function queryEleCustom(param) {
  return request(`/api/electric/office/custom?${stringify(param)}`);
}

export async function enterEleCustom(param) {
  return request('/api/electric/office/custom', {
    method: 'POST',
    body: param
  })
}

export async function queryElePublic(param) {
  return request(`/api/electric/office/apublic?${stringify(param)}`);
}

export async function enterEleCommon(param) {
  return request('/api/electric/office/common', {
    method: 'POST',
    body: param
  })
}

export async function queryEleCommon(param) {
  return request(`/api/electric/office/common?${stringify(param)}`);
}

export async function queryEleWCustom(param) {
  return request(`/api/electric/ware/custom?${stringify(param)}`);
}

export async function queryEleWCommon(param) {
  return request(`/api/electric/ware/common?${stringify(param)}`);
}

export async function enterEleWCustom(param) {
  return request(`/api/electric/ware/custom`, {
    method: 'POST',
    body: param 
  });
}

export async function enterEleWCommon(param) {
  return request(`/api/electric/ware/common`, {
    method: 'POST',
    body: param
  });
}

export async function queryElePCommon(param) {
  return request(`/api/electric/phase/common?${stringify(param)}`);
}

export async function enterElePCommon(param) {
  return request(`/api/electric/phase/common`, {
    method: 'POST',
    body: param
  });
}

export async function queryEleMeter(param) {
  return request(`/api/electric/set/common?${stringify(param)}`);
}
export async function queryEleWCMeter(param) {
  return request(`/api/electric/set/custom?${stringify(param)}`)
}
export async function queryEleMeterById(param) {
  return request(`/api/electric/set/custom/${param}`);
}

export async function enterEleMeter(param) {
  return request(`/api/electric/set/common`, {
    method: 'POST',
    body: param
  });
}

export async function enterEleCMeter(param) {
  return request(`/api/electric/set/custom`, {
    method: 'POST',
    body: param
  });
}

export async function queryPublicAll(param) {
  return request(`/api/water/set/pointId?${stringify(param)}`)
}

export async function editPublicAll(param) {
  return request('/api/water/set/pointId', {
    method: 'PUT',
    body: param
  })
}

export async function queryPublicAllEle(param) {
  return request(`/api/electric/set/pointId?${stringify(param)}`)
}

export async function editPublicAllEle(param) {
  return request('/api/electric/set/pointId', {
    method: 'PUT',
    body: param
  })
}