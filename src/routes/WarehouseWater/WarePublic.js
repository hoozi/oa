/* import React, { Component, PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import {
  DatePicker,
  Table,
  InputNumber,
  Checkbox,
  Button,
  Alert,
  Card
} from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import find from 'lodash/find';

const MonthPicker = DatePicker.MonthPicker;

const now = Date.now();
const nowYear = moment(now).year();
const nowMonth = moment(now).month()+1;
const disabledMonth = function(current) {
  return current && current > moment().endOf('day');
}

const defaultPagination = {
  current: 1,
  size: 10
}

@connect(({ energy, loading, global }) => ({
  energy,
  global,
  loading: loading.models.energy
}))
export default class OfficePublic extends PureComponent {
  static contextTypes = {
    getFloors: PropTypes.func
  }
  state = {
    data: [],
    searchValues: {
      year: nowYear,
      month: nowMonth,
    }
  }
  values = []
  componentDidMount() {
    this.getRecordsPage();
  }
  getRecordsPage(payload) {
    this.setState((prevState) => {
      const newSearchValues = {
        ...prevState.searchValues,
        ...defaultPagination,
        ...payload,
        searchType: 1
      }
      this.props.dispatch({
        type: 'energy/fetchOffice',
        officeType: 'public',
        payload: newSearchValues
      });
      return {
        searchValues: newSearchValues
      };
    })
  }
  handleMonthChange = (date) => {
    const year = date.year();
    const month = date.month()+1;
    this.getRecordsPage({ year, month });
  }
  handleTableChange = pagination => {
    const { current, pageSize: size } = pagination;
    this.getRecordsPage({ current, size })
  }
  handleDegreeChange = (e, name, key) => {
    find(this.values, {nid: key})[name] = name === 'flag' ? (e.target.checked ? 1 : 0) : e;
  }
  handleSaveData = () => {
    const { year, month } = this.state.searchValues;
    const payload = this.values.map(item => {
      const { nid, degree, lastDegree, flag } = item;
      return { nid, degree: flag == 1 ? lastDegree : degree, flag, month, year }
    });
    this.props.dispatch({
      type: 'energy/enterOffice',
      officeType: 'public',
      payload,
      callback: () => {
        this.getRecordsPage({...this.state.searchValues});
      }
    })
  }
  renderTableFooter = () => {
    return (
      <div style={{textAlign:'center'}}>
        <Button type='primary' onClick={this.handleSaveData} style={{marginRight: 16}}>保存</Button>
      </div>
    )
  }

  render() {
    const { energy: { records, current, total }, global: { floors }, loading } = this.props;
    
    this.values = records.map(item=>({...item}));
    
    const columns = [
      {
        title: '名称',
        width: '15%',
        dataIndex: 'name',
        render: (value) => value ? value : '-'
      },
      {
        title: '本月度数',
        dataIndex: 'degree',
        width: '10%',
        render: (value, row, index) => <InputNumber key={row.nid+Date.now()} onChange={ e => this.handleDegreeChange(e, 'degree', row.nid) } step='10' min={0} autoFocus={index==0} defaultValue={value} style={{width: '100%'}}/>
      },
      {
        title: '上月度数',
        dataIndex: 'lastDegree'
      },
      {
        title: '实用数(吨)',
        dataIndex: 'useDegree'
      },
      {
        title: '本月未抄',
        dataIndex: 'flag',
        render: (value, row, index) => <Checkbox key={row.nid} tabIndex='-1' onChange={ e => this.handleDegreeChange(e, 'flag', row.nid) } defaultChecked={value}/>
      }
    ];

    const paginationProps = {
      current,
      total,
      showQuickJumper: true
    }

    return (
      <Fragment>
        <Card
          bordered={false}
          style={{marginBottom: 24}}
        >
          <span style={{textAlign: 'center'}}>
            选择年月&nbsp;&nbsp;
            <MonthPicker disabledDate={disabledMonth} defaultValue={moment(now)} onChange={this.handleMonthChange} placeholder='请选择'/>
          </span>
        </Card>
        <Card
          bordered={false}
        >
            <Alert message='若本月未抄，则本月度数默认为上月度数' closable type="warning" showIcon style={{marginBottom: 24}}/>
            <Table
              size='middle'
              rowKey={(row, index) => ('public-'+row.nid+'-'+index)}
              bordered
              loading={loading}
              pagination={paginationProps}
              onChange={this.handleTableChange}
              columns={columns}
              dataSource={records}
              footer={this.renderTableFooter}
            />
          
        </Card>
      </Fragment>
    )
  }
} */


import React from 'react';
import { connect } from 'dva';
import BasicWater from './BasicWater';

const WarehousePublic = connect(({ energy, loading, global }) => ({
  energy,
  global,
  loading: loading.models.energy,
  submitting: loading.effects['energy/enterWarehouse']
}))(BasicWater('public', function({ InputNumber,Checkbox  }){
  return [
    {
      title: '名称',
      width: '15%',
      dataIndex: 'name',
      render: (value) => value ? value : '-'
    },
    {
      title: '本月度数',
      dataIndex: 'degree',
      width: '10%',
      render: (value, row, index) => <InputNumber key={row.nid+Date.now()} onChange={ e => this.handleFieldChange(e, 'degree', row.nid) } step='10' min={0} autoFocus={index==0} defaultValue={value} style={{width: '100%'}}/>
    },
    {
      title: '上月度数',
      dataIndex: 'lastDegree'
    },
    {
      title: '实用数(吨)',
      dataIndex: 'useDegree'
    },
    {
      title: '本月未抄',
      dataIndex: 'flag',
      render: (value, row, index) => <Checkbox key={row.nid} tabIndex='-1' onChange={ e => this.handleFieldChange(e, 'flag', row.nid) } defaultChecked={value}/>
    }
  ];
}));

export default WarehousePublic;