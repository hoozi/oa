import { queryRoomPage as query, updateBill, editRoom as edit, deleteRoom as del, addRoom as add, queryRoomInfo  } from '../services/room'
import { message } from 'antd';

export default {
	namespace: 'room',
	state: {
		records: [],
		total: 0,
		size: 10,
		current: 1,
		roomInfo: [],
		pages: 0
	},
	effects: {
		*fetch({ payload }, { call, put, select }) {
			const { current, size, areaId } = yield select(state => state.room);
			const response = yield call(query, { current, size, ...payload });
			if( typeof response === 'undefined' || response.code !== 1000 ) return;
			yield put({
				type: 'save',
				payload: response.data
			});
		},
		*fetchRoomInfo({ payload }, { call, put, select }) {
			const response = yield call(queryRoomInfo, {...payload});
			if( typeof response === 'undefined' || response.code !== 1000 ) return;
			yield put({
				type: 'save',
				payload: {
					roomInfo: response.data
				}
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
		},
		*updateBill({ payload, callback }, {call}) {
			const response = yield call( updateBill, payload );
			if( typeof response === 'undefined' || response.code !== 1000 ) return message.error('更新失败');;
			message.success('账单更新成功');
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