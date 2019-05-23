import { queryFloor as query, editFloor as edit, deleteFloor as del, addFloor as add } from '../services/floor'
import { message } from 'antd';

export default {
	namespace: 'floor',
	state: {
		data: []
	},
	effects: {
		*fetch({ payload }, { call, put, select }) {
			const response = yield call(query, payload);
			if( typeof response === 'undefined' || response.code !== 1000 ) return;
			yield put({
				type: 'save',
				payload: response.data
			});
		},
		*edit({ payload, oper, callback }, { call, put, select }) {
			const map = {
					'delete': {
						fn: del,
						msg: '删除成功',
						param: payload
					},
					'add': {
							fn: add,
							msg: '添加成功',
							param: payload
					},
					'edit': {
							fn: edit,
							msg: '编辑成功',
							param: payload
					}
			}
			const response = yield call( map[oper].fn, map[oper].param );
			if( typeof response === 'undefined' || response.code !== 1000 ) return;
			message.success(map[oper].msg);
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