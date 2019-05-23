import React from 'react';
import { connect } from 'dva';
import Basic from './BasicEle';

export default connect(({ energy, global, loading }) => ({
  energy,
  global,
  loading: loading.models.energy,
  submitting: loading.effects['energy/enterEle'],
  floorFetch: loading.effects['global/fetchFloor']
}))(
  Basic('common')
)
