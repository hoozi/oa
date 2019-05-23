import React from 'react';
import { connect } from 'dva';
import Basic from './Basic';

export default connect(({ energy, contract, global, loading }) => ({
  energy,
  contract,
  global,
  loading: loading.models.energy,
  submitting: loading.effects['energy/enterWaterMeter']
}))(
  Basic('phase2')
)