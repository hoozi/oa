import { queryRepair, editRepair, addRepair, deleteRepair } from '../services/repair'
import { message } from 'antd';

export default {
	namespace: 'repair',
	state: {
		page: {
			records: [],
			total: 0,
			size: 15,
			current: 1,
			pages: 0
		}
	},
	effects: {
		*fetch({ payload }, { call, put, select }) {
			const { current, size } = yield select(state => state.repair.page);
			const response = yield call(queryRepair, { current, size, ...payload });
			if( typeof response === 'undefined' || response.code !== 1000 ) return;
			yield put({
				type: 'save',
				payload: response.data
			});
		},
		*putRepair({ payload, callback }, { call, put, select }) {
			const response = yield call( editRepair, payload);
			if( typeof response === 'undefined' || response.code !== 1000 ) return;
			message.success('操作成功');
			callback && callback();
		},
		*addRepair({payload, callback}, { call }) {
			const response = yield call(addRepair, payload);
			if( typeof response === 'undefined' || response.code !== 1000 ) return;
			message.success('操作成功');
			callback && callback();
		},
		*deleteRepair({payload, callback}, { call }) {
			const response = yield call(deleteRepair, payload);
			if( typeof response === 'undefined' || response.code !== 1000 ) return;
			message.success('操作成功');
			callback && callback();
		}
	},
	reducers: {
		save(state, { payload }) {
				return {
						...state,
						page: payload
				}
		}
	}
}