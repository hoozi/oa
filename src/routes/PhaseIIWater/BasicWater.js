import React, { Component, PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import {
  DatePicker,
  Table,
  Checkbox,
  Button,
  Alert,
  InputNumber,
  Tag,
  Select,
  Form,
  Card
} from 'antd';
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

const BasicWater = (type, columnsFn) => {
  return class extends PureComponent {
    static contextTypes = {
      getFloors: PropTypes.func
    }
    state = {
      searchValues: {
        year: nowYear,
        month: nowMonth,
        floorId: ''
      }
    }
    componentDidMount() {
      this.getRecordsPage();
    }
    getRecordsPage(payload) {
      this.setState((prevState) => {
        const newSearchValues = {
          ...prevState.searchValues,
          ...defaultPagination,
          ...payload
        }
        this.props.dispatch({
          type: 'energy/fetchPhase2',
          payload: newSearchValues
        });
        return {
          searchValues: newSearchValues
        };
      })
    }
    handleFloorChange = (floorId) => {
      this.getRecordsPage({ floorId });
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
    handleFieldChange = (e, name, key) => {
      const byId = {nid: key};
      find(this.values, byId)[name] = name === 'flag' ? (e.target.checked ? 1 : 0) : e;
    }
    handleKeyPress = e => {
      if(e.key=='Enter') {
        this.handleSaveData()
      }
    }
    handleSaveData = (e) => {
      e.preventDefault();
      const { month, year } = this.state.searchValues;
      const payload = this.values.map(item => {
        const { rid, degree, flag, lastDegree, id='', nid } = item;
        return { id, rid, nid, degree: flag == 1 ? lastDegree : degree, flag, month, year }
      });
      this.props.dispatch({
        type: 'energy/enterPhase2',
        payload,
        callback: () => {
          this.getRecordsPage({...this.state.searchValues});
        }
      })
    }
    renderTableFooter = () => {
      return (
        <div style={{textAlign:'center'}}>
          <Button type='primary' htmlType='submit' onClick={this.handleSaveData} style={{marginRight: 16}} loading={this.props.submitting}>保存</Button>
        </div>
      )
    }
    renderAlertMessage() {
      return (
        <Fragment>
          {type == 'A' ? <Fragment>没有查到对应的房间信息,请先在 <b>基础数据-房间管理</b> 中添加对应的房间信息</Fragment> : '暂无数据'}
        </Fragment>
      )
    }
    render() {
      const { energy: { records, current, total },  loading } = this.props;
      
      this.values = records.map(item=>({...item}));
      
      const columns = columnsFn.call(this, {
        InputNumber,
        Checkbox,
        Tag
      });
      
      const paginationProps = {
        current,
        total,
        showQuickJumper: true
      }
  
      const locale = {
        emptyText: this.renderAlertMessage()
      }
  
      return (
        <Fragment>
          <Card
            bordered={false}
            style={{marginBottom: 24}}
          >
            <span style={{marginRight:24}}>
              选择年月&nbsp;&nbsp;
              <MonthPicker disabledDate={disabledMonth}  defaultValue={moment(now)} onChange={this.handleMonthChange} placeholder='请选择'/>
            </span>
          </Card>
          <Card
            bordered={false}
          >
            <Alert message='若本月未抄，则本月度数默认为上月度数' closable type="warning" showIcon style={{marginBottom: 24}}/>
            <Form onSubmit={this.handleSaveData}>
              <Table
                size='middle'
                rowKey={(row, index) => (`${type}-${row.rid || row.nid}-${index}`)}
                bordered
                locale={locale}
                loading={loading}
                pagination={paginationProps}
                onChange={this.handleTableChange}
                columns={columns}
                dataSource={this.values}
                footer={this.renderTableFooter}
              />
            </Form>
          </Card>
        </Fragment>
      )
    }
  }
}

export default BasicWater;