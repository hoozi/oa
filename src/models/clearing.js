import { 
  queryClearing,
  queryPowerDetail,
  queryWaterDetail
} from '../services/clearing'
import {
	message,
	Modal
} from 'antd';

export default {
	namespace: 'clearing',
	state: {
		records: [],
		total: 0,
		size: 10,
		current: 1,
		pages: 0,
		water: [],
		power: []
	},
	effects: {
		*fetch({ payload }, { call, put, select }) {
			const { current, size, areaId } = yield select(state => state.clearing);
			const response = yield call(queryClearing, { current, size, areaId, valid: 1, ...payload });
			if( typeof response === 'undefined' || response.code !== 1000 ) return;
			yield put({
				type: 'save',
				payload: {
					...response.data
				}
			});
		},
		*fetchWaterById({ payload }, { call, put }) {
			const response = yield call(queryWaterDetail, payload);
			if( typeof response === 'undefined' || response.code !== 1000 ) return;
			yield put({
				type: 'save',
				payload: {
					water: response.data
				}
			});
    },
    *fetchPowerById({ payload }, { call, put }) {
			const response = yield call(queryPowerDetail, payload);
			if( typeof response === 'undefined' || response.code !== 1000 ) return;
			yield put({
				type: 'save',
				payload: {
					power: response.data
				}
			});
    },
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