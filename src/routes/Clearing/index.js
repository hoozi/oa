import React, {  PureComponent, Fragment } from 'react';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import { connect } from 'dva';
import PropTypes from 'prop-types';
import {
  Card,
  Radio,
  Table,
  Drawer,
  Form,
  Row,
  Select,
  Col,
  DatePicker,
  Input,
  Button,
  Divider
} from 'antd';
import moment from 'moment';
import 'moment/locale/zh-cn';
moment.locale('zh-cn');
import { stringify } from 'qs';

//3.4.3
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
const FormItem = Form.Item;
const MonthPicker = DatePicker.MonthPicker;
const Option = Select.Option;

const now = Date.now();
const nowYear = moment(now).year();
const nowMonth = moment(now).month()+1;
const formItemLayout = {
  labelCol: { span: 5, offset: 0},
  wrapperCol: { span: 19 }
};

const pStyle = {
  fontSize: 16,
  color: 'rgba(0,0,0,0.85)',
  lineHeight: '24px',
  display: 'block',
  marginBottom: 16,
};

const DescriptionItem = ({ title, content }) => (
  <div
    style={{
      fontSize: 14,
      lineHeight: '22px',
      marginBottom: 7,
      color: 'rgba(0,0,0,0.65)',
    }}
  >
    <p
      style={{
        marginRight: 8,
        display: 'inline-block',
        color: 'rgba(0,0,0,0.85)',
      }}
    >
      {title}:
    </p>
    {content}
  </div>
);

const disabledMonth = function(current) {
  return current && current > moment().endOf('day');
}

@Form.create()
@connect(({clearing, loading, global}) => ({
  ...clearing,
  global,
  fetching: loading.effects['clearing/fetch'],
  fetchWatering: loading.effects['clearing/fetchWateById'],
  fetchPowering: loading.effects['clearing/fetchPowerById'],
}))
export default class Clearing extends PureComponent {
  static contextTypes = {
    getFloors: PropTypes.func
  };
  state = {
    searchValues: {
      areaId: '11',
      year: nowYear,
      month: nowMonth
    },
    drawerVisible: false,
    currentData: {}
  }
  componentDidMount() {
    this.initData();
  }
  initData() {
    const { searchValues: { areaId } } = this.state;
    this.getClearing();
    this.context.getFloors(areaId)
  }
  getClearing(payload) {
    const { searchValues } = this.state
    this.props.dispatch({
      type: 'clearing/fetch',
      payload: {
        ...searchValues,
        ...payload
      }
    })
  }
  getEnergy(code) {
    const { dispatch } = this.props;
    const { searchValues: {year, month} } = this.state
    dispatch({
      type: 'clearing/fetchWaterById',
      payload: {code, year, month}
    });
    dispatch({
      type: 'clearing/fetchPowerById',
      payload: {code, year, month}
    })
  }
  handleAreaIdChange = areaId => {
    this.getClearing({ areaId, current:1 });
    this.context.getFloors(areaId);
    this.handleChangeField('areaId', areaId);
  }
  handleChangeField = (name, value) => {
    const { searchValues } = this.state;
    this.setState({
      searchValues: {
        ...searchValues,
        [name]: value
      }
    })
  }
  handlePaginationChange = pagination => {
    const { current } = pagination;
    const { searchValues } = this.state
    this.getClearing({
      ...searchValues,
      current
    })
  }
  handleShowDetail = currentData => {
    this.handleDrawerShow(true);
    this.getEnergy(currentData.code)
    this.setState({ currentData })
  }
  handleDrawerShow = flag => {
    this.setState({
      drawerVisible: !!flag
    })
  }
  handleResetSearch = () => {
    const { form } = this.props;
    form.resetFields();
    this.setState({
      searchValues: {
        areaId: this.state.areaId,
        year: nowYear,
        month: nowMonth
      }
    });
    this.getClearing()
  }
  handleClearingSearch = e => {
    e.preventDefault();
    const { form } = this.props;
    const { searchValues } = this.state;
    const { areaId } = searchValues;
    form.validateFields((err, values) => {
      if(err) return;
      const { _ym } = values;
      const format = _ym.format('YYYY-M').split('-');
      if(_ym) {
        values.year = format[0];
        values.month = format[1];
        delete values['_ym'];
      }
      this.setState({
        searchValues: {
          ...searchValues,
          ...values
        }
      });
      this.getClearing({
        areaId,
        ...values
      })
    })
  }
  handleExport = () => {
    const { searchValues } = this.state;
    const query = stringify(searchValues);
    window.open(`/api/balance/excel?${query}`);
  }
  renderSearchForm = () => {
    const { form: { getFieldDecorator } } = this.props;
    const { floors } = this.props.global;
    return (
      <Form onSubmit={this.handleClearingSearch}>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label='选择月份' {...formItemLayout} style={{width: '100%', marginBottom: '16px'}}>
              {
                getFieldDecorator('_ym', {
                  initialValue: moment(now)
                })(
                  <MonthPicker placeholder='请选择' style={{width: '100%'}}/>
                )
              }
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label='合同编号' {...formItemLayout} style={{width: '100%', marginBottom: '16px'}}>
              {
                getFieldDecorator('code')(
                  <Input placeholder='请输入'/>
                )
              }
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label='公司名称' {...formItemLayout} style={{width: '100%', marginBottom: '16px'}}>
              {
                getFieldDecorator('companyName')(
                  <Input placeholder='请输入'/>
                )
              }
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label='楼　　层' {...formItemLayout} style={{width: '100%', marginBottom: '16px'}}>
              {getFieldDecorator('fmin')(
                <Select placeholder='请选择楼层' style={{ width: '100%' }}>
                  { floors.length ? floors.map(floor => {
                    return <Option key={floor.id} value={floor.floor}>{floor.name}</Option>
                  }) : ''}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label='房间号' {...formItemLayout} style={{width: '100%', marginBottom: '16px'}}>
              {getFieldDecorator('roomsName')(
                <Input placeholder='请输入'/>
              )}
            </FormItem>
          </Col>
        </Row>
        <div style={{float: 'right'}}>
          <Button type='primary' htmlType='submit'>
            查询
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={this.handleResetSearch}>
            重置
          </Button> 
        </div>
      </Form>
    )
  }
  renderProfile = current => (
    current ? <Fragment>
      <p style={pStyle}>合同信息</p>
      <Row>
        <Col span={12}>
          <DescriptionItem title='编号' content={current.code || '-'} />
        </Col>
        <Col span={12}>
          <DescriptionItem title='公司名称' content={current.companyName || '-'} />
        </Col>
      </Row>
      <Row>
        <Col span={12}>
          <DescriptionItem title='法人' content={current.renter || '-'} />
        </Col>
        <Col span={12}>
          <DescriptionItem title='联系电话' content={current.tel || '-'} />
        </Col>
      </Row>
      <Row>
        <Col span={12}>
          <DescriptionItem title='租金' content={current.rent || '-'} />
        </Col>
        <Col span={12}>
          <DescriptionItem title='押金' content={current.deposit || '-'} />
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <DescriptionItem
            title='备注'
            content={current.remark || '-'}
          />
        </Col>
      </Row>
      <Divider/>
      <p style={pStyle}>用水信息</p>
      <Row>
        <Col span={24}>
          <Table
            loading={this.props.fetchWatering}
            dataSource={this.props.water}
            pagination={false}
            rowKey={row => row.id}
            size='small'
            columns={[
              {
                title: '名称',
                dataIndex: 'pointName'
              },
              {
                title: '上月用水',
                dataIndex: 'start'
              },
              {
                title: '本月用水',
                dataIndex: 'end'
              },
              {
                title: '用水合计',
                dataIndex: 'totalPower'
              },
              {
                title: '合计水费',
                dataIndex: 'totalMoney'
              }
            ]}
          />
        </Col>
      </Row>
      <p style={{...pStyle, marginTop: 24}}>用电信息</p>
      <Row>
        <Col span={24}>
          <Table
            loading={this.props.fetchPowering}
            dataSource={this.props.power}
            pagination={false}
            rowKey={row => row.id}
            size='small'
            columns={[
              {
                title: '名称',
                dataIndex: 'pointName'
              },
              {
                title: '上月用电',
                dataIndex: 'zongStart'
              },
              {
                title: '本月用电',
                dataIndex: 'zongEnd'
              },
              {
                title: '用电合计',
                dataIndex: 'totalPower'
              },
              {
                title: '合计电费',
                dataIndex: 'totalMoney'
              }
            ]}
          />
        </Col>
      </Row>
    </Fragment> : null
  )
  render() {
    const { searchValues: { areaId }, drawerVisible, currentData } = this.state;
    const { fetching, records: list, current, total } = this.props
    const action = (
      <RadioGroup value={areaId} onChange={ e => this.handleAreaIdChange(e.target.value) }>
        <RadioButton value='11'>写字楼A</RadioButton>
        <RadioButton value='13'>写字楼B</RadioButton>
        <RadioButton value='10'>仓库</RadioButton>
        <RadioButton value='12'>配套用房</RadioButton>
        <RadioButton value='14'>二期</RadioButton>
      </RadioGroup>
    )
    const columns = [
      {
        title: '合同编号',
        dataIndex: 'code',
        render: (value, row) => <a onClick={ () => this.handleShowDetail(row)}>{value}</a>
      },
      {
        title: '单位名称',
        dataIndex: 'companyName'
      },
      {
        title: '租用房间',
        dataIndex: 'roomsName'
      },
      {
        title: '合计用水',
        dataIndex: 'waterDegree'
      },
      {
        title: '合计水费',
        dataIndex: 'waterFee'
      },
      {
        title: '合计用电',
        dataIndex: 'powerDegree'
      },
      {
        title: '合计电费',
        dataIndex: 'powerFee'
      },
      {
        title: '预收金额',
        dataIndex: 'advTotal'
      },
      {
        title: '账户余额',
        dataIndex: 'balance'
      }
    ]
    const pagination = {
      current,
      total
    }
    return (
      <PageHeaderLayout
        title='费用结算'
        action={action}
      >
        <Card
          bordered={false}
          style={{marginBottom: '24px'}}
        >
          {this.renderSearchForm()}
        </Card>
        <Card
          bordered={false}
        >
          <Button type='primary' icon='export' onClick={() => this.handleExport()} style={{marginBottom: 16}}>水电费导出</Button>
          <Table
            columns={columns}
            bordered
            rowKey={record => record.id}
            onChange={ this.handlePaginationChange }
            dataSource={list}
            pagination={pagination}
            loading={fetching}
            size='middle'
          />
        </Card>
        <Drawer
          placement='right'
          width={640}
          closable={false}
          onClose={() => this.handleDrawerShow(false)}
          visible={drawerVisible}
          destroyOnClose
        >
          {this.renderProfile(currentData)}
        </Drawer>
      </PageHeaderLayout>
    )
  }
}