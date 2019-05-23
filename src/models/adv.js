import { queryAdv as query, queryDetail as qd, addAdv, advCost, advPay, querySurDetail as qsd } from '../services/adv'
import {
	message
} from 'antd';

const payFn = {
	add: addAdv,
	adv: advCost,
	pay: advPay
}

export default {
	namespace: 'adv',
	state: {
		advData: {
			records: [],
			total: 0,
			size: 10,
			current: 1,
			detail: [],
			pages: 0
		},
		detailData: {
			records: [],
			total: 0,
			size: 10,
			current: 1,
			detail: [],
			pages: 0
		},
		surData: {
			records: [],
			total: 0,
			size: 10,
			current: 1,
			detail: [],
			pages: 0
		}
	},
	effects: {
		*fetch({ payload }, { call, put, select }) {
			const { current, size } = yield select(state => state.contract);
			const response = yield call(query, { current, size, ...payload });
			if( typeof response === 'undefined' || response.code !== 1000 ) return;
			yield put({
				type: 'save',
				payload: {
					advData: {...response.data}
				}
			});
		},
		*fetchDetail({ payload }, { call, put, select }) {
			const { current, size } = yield select(state => state.contract);
			const response = yield call(qd, { current, size, ...payload });
			if( typeof response === 'undefined' || response.code !== 1000 ) return;
			yield put({
				type: 'save',
				payload: {
					detailData: {...response.data}
				}
			});
		},
		*fetchSurDetail({ payload }, { call, put, select }) {
			const { current, size } = yield select(state => state.contract);
			const response = yield call(qsd, { current, size, ...payload });
			if( typeof response === 'undefined' || response.code !== 1000 ) return;
			yield put({
				type: 'save',
				payload: {
					surData: {...response.data}
				}
			});
		},
		*editAdv({ payload, callback, aType }, { call }) {
			const response = yield call(payFn[aType] , payload );
			if( typeof response === 'undefined' || response.code !== 1000 ) return;
			message.success('操作成功');
			callback && callback();
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