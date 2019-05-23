import { 
	queryOfficeA, 
	queryOfficePublic, 
	enterOfficeA, 
	enterOfficePublic, 

	queryWare, 
	queryWarePublic, 
	enterWare, 
	enterWarePublic,

	queryPhase2,
	enterPhase2,

	queryWaterMeter,

	queryWaterRoom,
	enterWaterMeter,
	editRoomBatch,

	queryEleCustom,
	enterEleCustom,
	queryElePublic,
	enterEleCommon,
	queryEleCommon,
	queryEleWCustom,
	queryEleWCommon,
	enterEleWCustom,
	enterEleWCommon,
	queryElePCommon,
	enterElePCommon,

	queryEleMeter,
	queryEleWCMeter,
	enterEleMeter,
	enterEleCMeter,
	queryEleMeterById,

	queryPublicAll,
	editPublicAll,

	queryPublicAllEle,
	editPublicAllEle
}  from '../services/energy';
import { message } from 'antd';

const getEnterFn = name => {
	const fnMap = {
		'A': enterOfficeA,
		'public': enterOfficePublic,
		'business': enterOfficePublic
	}
	return fnMap[name]
}
const getSearchFn = name => {
	const fnMap = {
		'A': queryOfficeA,
		'public': queryOfficePublic,
		'business': queryOfficePublic,
		'custom': queryEleCustom,
		'publicA':queryElePublic ,
		'common':queryEleCommon,
		'wCustom': queryEleWCustom,
		'wCommon':queryEleWCommon,
		'pCustom': queryElePCommon
	}
	return fnMap[name]
}
const getWareSearchFn = name => {
	const fnMap = {
		'ware': queryWare,
		'public': queryWarePublic,
		'business': queryWarePublic
	}
	return fnMap[name]
}
const getWareEnterFn = name => {
	const fnMap = {
		'ware': enterWare,
		'public': enterWarePublic,
		'business': enterWarePublic
	}
	return fnMap[name]
}

const getEleEnterFn = name => {
	const fnMap = {
		'custom': enterEleCustom,
		'publicA': enterEleCommon,
		'common': enterEleCommon,
		'wCustom':enterEleWCustom,
		'wCommon':enterEleWCommon,
		'pCustom':enterElePCommon
	}
	return fnMap[name]
}

export default {
  namespace: 'energy',
  state: {
		records: [],
		total: 0,
		size: 10,
		current: 1,
		pages: 0,
		edata: []
  },
  effects: {
    *fetchOffice({ payload, officeType }, { call, put, select }) {
			const { current, size } = yield select(state => state.energy);
			const response = yield call(getSearchFn(officeType), { current, size, ...payload });
			if( typeof response === 'undefined' || response.code !== 1000 ) return;
			yield put({
				type: 'save',
				payload: {
					...response.data
				}
			});
		},
		*enterOffice({ payload, callback, officeType }, { call, put, select }) {
			const response = yield call( getEnterFn(officeType), payload );
			if( typeof response === 'undefined' || response.code !== 1000 ) return;
			message.success('录入成功');
			callback && callback();
		},
		*fetchWarehouse({ payload, wareType }, { call, put, select }) {
			const { current, size } = yield select(state => state.energy);
			const response = yield call(getWareSearchFn(wareType), { current, size, ...payload });
			if( typeof response === 'undefined' || response.code !== 1000 ) return;
			yield put({
				type: 'save',
				payload: {
					...response.data
				}
			});
		},
		*enterWarehouse({ payload, callback, wareType }, { call, put, select }) {
			const response = yield call( getWareEnterFn(wareType), payload );
			if( typeof response === 'undefined' || response.code !== 1000 ) return;
			message.success('录入成功');
			callback && callback();
		},
		*fetchPhase2({ payload }, { call, put, select }) {
			const { current, size } = yield select(state => state.energy);
			const response = yield call(queryPhase2, { current, size, ...payload });
			if( typeof response === 'undefined' || response.code !== 1000 ) return;
			yield put({
				type: 'save',
				payload: {
					...response.data
				}
			});
		},
		*enterPhase2({ payload, callback }, { call, put, select }) {
			const response = yield call( enterPhase2, payload );
			if( typeof response === 'undefined' || response.code !== 1000 ) return;
			message.success('录入成功');
			callback && callback();
		},
		*fetchWaterMeter({ payload, meterType }, { call, put, select }) {
			const { current, size } = yield select(state => state.energy);
			const response = yield call(meterType == 'WC' ? queryWaterRoom :queryWaterMeter, { current, size, ...payload });
			if( typeof response === 'undefined' || response.code !== 1000 ) return;
			yield put({
				type: 'save',
				payload: {
					...response.data
				}
			});
		},
		*fetchEleMeter({ payload, meterType }, { call, put, select }) {
			const { current, size } = yield select(state => state.energy);
			const response = yield call(meterType == '1099' ? queryEleWCMeter : queryEleMeter, { current, size, ...payload });
			if( typeof response === 'undefined' || response.code !== 1000 ) return;
			yield put({
				type: 'save',
				payload: {
					...response.data
				}
			});
		},
		*enterEleMeter({ payload, callback, modalType }, { call }) {
			const response = yield call( modalType == 'edit' ? editPublicAllEle : enterEleMeter, payload );
			if( typeof response === 'undefined' || response.code !== 1000 ) return;
			message.success('保存成功');
			callback && callback();
		},
		*enterWaterMeter({ payload, callback, modalType }, { call }) {
			const response = yield call( modalType == 'edit'? editPublicAll : enterWaterMeter, payload );
			if( typeof response === 'undefined' || response.code !== 1000 ) return;
			message.success('操作成功');
			callback && callback();
		},
		*fetchEle({ payload, areaType },{ call, put, select }) {
			const { current, size } = yield select(state => state.energy);
			const response = yield call(getSearchFn(areaType), { current, size, ...payload });
			if( typeof response === 'undefined' || response.code !== 1000 ) return;
			yield put({
				type: 'save',
				payload: {
					...response.data
				}
			});
		},
		*fetchEleById({ payload, callback }, { call }) {
			const response = yield call(queryEleMeterById, payload);
			if( typeof response === 'undefined' || response.code !== 1000 ) return;
			callback && callback(response.data);
		},
		*enterEle({ payload, callback, areaType }, { call }) {
			const response = yield call(getEleEnterFn(areaType) , payload );
			if( typeof response === 'undefined' || response.code !== 1000 ) return;
			message.success('保存成功');
			callback && callback();
		},
		*fetchPublicAll({ payload }, { call, put }) {
			const response = yield call(queryPublicAll, { ...payload });
			if( typeof response === 'undefined' || response.code !== 1000 ) return;
			yield put({
				type: 'save',
				payload: {
					data: response.data
				}
			});
		},
		*fetchPublicAllEle({ payload }, { call, put }) {
			const response = yield call(queryPublicAllEle, { ...payload });
			if( typeof response === 'undefined' || response.code !== 1000 ) return;
			yield put({
				type: 'save',
				payload: {
					data: response.data
				}
			});
		}
		
	},
  reducers: {
		save(state, { payload }) {
				return {
						...state,
						...payload
				}
		}
	}
}