import React from 'react';
import { connect } from 'dva';
import Basic from './Basic';

export default connect(({ statistical, loading }) => ({
  statistical,
  loading: loading.models.statistical,
}))(
  Basic('office')
)