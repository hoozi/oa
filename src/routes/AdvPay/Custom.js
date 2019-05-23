import React, {
  PureComponent,
  Fragment
} from 'react';
import PropTypes from 'prop-types';
import {
  Form,
  Table,
  Checkbox,
  Tag,
  Modal,
  Button,
  Select,
  Input,
  message,
  Divider,
  DatePicker,
  InputNumber,
  Spin,
  Timeline,
  Card,
  Icon,
  Alert
} from 'antd';
import { connect } from 'dva';
import SearchForm from './SearchForm';
import moment from 'moment';
import debounce from 'lodash/debounce';
import styles from './index.less'

const FormItem = Form.Item;
const Option = Select.Option;
const TextArea = Input.TextArea;
const TimelineItem = Timeline.Item;
const Search = Input.Search;

@connect(({ adv, contract, global, loading }) => ({
  adv,
  contract,
  global,
  floorFetch: loading.effects['global/fetchFloor'],
  areaFetch: loading.effects['global/fetchArea'],
  contractFetch: loading.effects['contract/fetch'], 
  idFetch: loading.effects['contract/fetchById'], 
  submitting: loading.effects['adv/editAdv'],
  detailFetch: loading.effects['adv/fetchDetail'],
  surDetailFetch: loading.effects['adv/fetchSurDetail'],
  loading: loading.models.adv
}))
@Form.create() 
export default class Custom extends PureComponent {
  static contextTypes = {
    getArea: PropTypes.func,
    getFloors: PropTypes.func
  }
  state = {
    searchValues: {
      floor: '',
      areaId: '',
      valid: '',
      accountName: '',
      advStartDate: '',
      advEndDate: ''
    },
    postValues: {
      cid: null,
      currentContract: null
    },
    updateValues: {},
    addModalVisible: false,
    advModalVisible: false,
    advDModalVisible: false,
    advPayModalVisible: false,
    advDPModalVisible: false
  }
  componentWillMount() {
    this.getPage();
    this.getContract();
    this.context.getArea();
  }
  mergeSearchValues(value) {
    const { searchValues } = this.state;
    const mergeValues = {
      ...searchValues,
      ...value
    }
    this.setState({
      searchValues: mergeValues
    }, ()=> {
      this.getPage({...mergeValues});
    })
  }
  getPage(payload) {
    const { searchValues } = this.state;
    const mergeValues = {
      current: 1,
      size: 15,
      ...searchValues,
      ...payload
    }
    this.props.dispatch({
      type: 'adv/fetch',
      payload: mergeValues
    })
  }
  getContract(payload) {
    this.props.dispatch({
      type: 'contract/fetch',
      payload: {
        isAccount: 0,
        vaild: 1,
        areaId: '',
        ...payload
      }
    });
  }
  getContractById(payload) {
    const { postValues } = this.state;
    this.props.dispatch({
      type: 'contract/fetchById',
      payload,
      callback: (currentContract) => {
        this.setState({
          postValues: {
            ...postValues,
            currentContract
          }
        })
      }
    })
  }
  saveAdv(payload, aType) {
    const typeMap = {
      'add': 'addModalVisible',
      'adv': 'advModalVisible',
      'pay': 'advPayModalVisible'
    }
    this.props.dispatch({
      type: 'adv/editAdv',
      aType,
      payload,
      callback: () => {
        this.getPage();
        this.handleModalVisible( typeMap[aType], false);
      }
    })
  }
  /* this.context.getArea();
    this.context.getFloors(areaId) */
  handleTableChange = pagination => {
    const { current, pageSize: size } = pagination;
    this.getPage({ current, size })
  }
  handleAreaChange = areaId => {
    this.mergeSearchValues({areaId, floor:''});
    areaId && this.context.getFloors(areaId);
  }
  handleFloorChange = floor => {
    this.mergeSearchValues({floor});
  }
  handleValidChange = valid => {
    this.mergeSearchValues({valid});
  }
  handleDateRangeChange = date => {
    this.mergeSearchValues({
      advStartDate: date[0].format('YYYY-MM-DD'),
      advEndDate: date[1].format('YYYY-MM-DD')
    })
  }
  handleInputSearch = accountName => {
    this.mergeSearchValues({accountName});
  }
  handleModalVisible = (name, flag, updateValues) => {
    this.setState({
      [name]: !!flag,
      updateValues: updateValues ? updateValues : {}
    });
    if(name == 'advDModalVisible' && updateValues) {
      this.props.dispatch({
        type: 'adv/fetchDetail',
        payload: {
          aid: updateValues.id,
          current: 1,
          size: 100
        }
      })
    } else if(name == 'advDPModalVisible' && updateValues) {
      this.props.dispatch({
        type: 'adv/fetchSurDetail',
        payload: {
          aid: updateValues.id,
          current: 1,
          size: 100
        }
      })
    }
  }
  handleAddCustom = () => {
    const { postValues: { cid } } = this.state;
    if(!cid) {
      message.error('请选择单位');
      return;
    } else {
      const { postValues: { currentContract: { companyName: accountName } } } = this.state
      this.saveAdv({ cid, accountName }, 'add');
    }
  }
  handleAdv = () => {
    const { form } = this.props;
    const { updateValues: {id: aid, cid} } = this.state;
    form.validateFields((err, fieldsValue) => {
      const { advance, advDate, remark } = fieldsValue;
      if(!advance) {
        message.error('请输入预收金额');
        return;
      }
      const postValues = {
        aid,
        cid,
        advance,
        advDate: advDate.format('YYYY-MM-DD'),
        remark
      };
      this.saveAdv({...postValues}, 'adv');
    })
  }
  handleAdvPay = () => {
    const { form } = this.props;
    const { updateValues: {id: aid, cid, balance:balCurrent} } = this.state;
    form.validateFields((err, fieldsValue) => {
      const { debit, debitDate, remark } = fieldsValue;
      if(!debit) {
        message.error('请输入扣款金额');
        return;
      }
      const postValues = {
        aid,
        cid,
        balCurrent,
        debit,
        debitDate: debitDate.format('YYYY-MM-DD'),
        remark
      };
      this.saveAdv({...postValues}, 'pay');
    })
  }  
  handleContractFilter = companyName => {
    this.getContract({companyName})
  }
  handleContractChange = cid => {
    this.setState({
      postValues: {cid}
    }, () => {
      this.getContractById(cid)
    });
  }
  render() {
    const { 
      global: {floors, areas}, 
      contract:{records: contracts}, 
      adv: {advData: {records, current, total},detailData:{records: detail},surData:{records: surDetail}}, 
      loading, 
      floorFetch, 
      areaFetch, 
      idFetch,
      contractFetch,
      form: {getFieldDecorator},
      submitting,
      detailFetch,
      surDetailFetch 
    } = this.props;
    const { 
      searchValues: {areaId, floor}, 
      postValues: { cid, currentContract }, 
      addModalVisible, 
      advModalVisible,
      advDModalVisible,
      advDPModalVisible,
      advPayModalVisible,
      updateValues 
    } = this.state;
    const SearchFormProps = {
      floors,
      areas,
      floorFetch,
      areaFetch,
      areaId,
      floor,

      onAreaChange: this.handleAreaChange,
      onValidChange: this.handleValidChange,
      onFloorChange: this.handleFloorChange,
      onDateRangeChange: this.handleDateRangeChange,
      onInputSearch: this.handleInputSearch
    }
    const paginationProps = {
      pageSize: 15,
      current,
      total,
      showQuickJumper: true
    }
    const columns = [
      {
        title: '公司名称',
        dataIndex: 'accountName'
      },
      {
        title: '合同日期',
        dataIndex: '',
        render: (value, row) => row.valid==1 ? `${moment(row.startDate).format('YYYY-MM-DD')} ~ ${moment(row.startDate).format('YYYY-MM-DD')}` : <Tag color='#f50'>已退租{moment(row.throwTime).format('YYYY-MM-DD')}</Tag>
      },
      {
        title: '房间号',
        dataIndex: 'roomNumber',
        width: '19%',
        render: (value, row) => value && (row.areaId!=12 && row.areaId!=14) ? value.split(',').map((item,index)=><Tag key={`${item}-${row.id}`} style={{marginRight:2}}>{item}</Tag>) : value
      },
      {
        title: '累计预收',
        dataIndex: 'advTotal',
        render: (value, row) => <a href='javascript:;' onClick={() => this.handleModalVisible('advDModalVisible', true, row)}>{value}元</a>
      },
      {
        title: '最后预收日期',
        dataIndex: 'advLastdate',
        render: value => moment(value).format('YYYY-MM-DD')
      },
      {
        title: '余额',
        dataIndex: 'balance',
        render: (value, row) => <a href='javascript:;' onClick={() => this.handleModalVisible('advDPModalVisible', true, row)} style={{color: value < 0 ? 'red' : 'green'}}>{value}元</a>
      },
      {
        title: '启用日期',
        dataIndex: 'startTime',
        render: value => moment(value).format('YYYY-MM-DD')
      },
      /* {//onChange={e => this.handleFieldChange(e.target.checked, 'isDel', index)}
        title: '停用',
        dataIndex: 'isDel',
        render: (value, row, index) => <Fragment><Checkbox defaultChecked={value} />{value?<span style={{color:'#fa541c'}}>{moment(row.delTime).format('YYYY-MM-DD')}</span>:''}</Fragment>
      }, */
      {
        title: '操作',
        render: (value, row) => {
          return (
            <Fragment>
              <a href='javascript:;' onClick={()=>this.handleModalVisible('advModalVisible', true, row)}>预收</a>
              <Divider type="vertical"/>
              <a href='javascript:;' onClick={()=>this.handleModalVisible('advPayModalVisible', true, row)}>扣款</a>
            </Fragment>
          )
          
        }
      }
    ]
    return (
      <Fragment>
        <Card
          bordered={false}
          style={{
            marginBottom: 24
          }}
        >
          <SearchForm
            {...SearchFormProps}
          />
        </Card>
        <Card
          bordered={false}
          bodyStyle={{paddingTop: 80}}
        >
          <span style={{position:'absolute', right:32, top: 24}}>
            <Search 
              placeholder='输入单位名称，按回车搜索'
              onSearch={this.handleInputSearch} 
            style={{width:230}}/>
          </span>
          {/* <Button 
            type='primary' 
            style={{marginBottom: 24}}
            onClick={() => this.handleModalVisible('addModalVisible', true)}
          >
            添加账号
          </Button> */}
          <Table
            bordered
            rowKey={row=>row.id}
            size='middle'
            columns={columns}
            dataSource={records}
            loading={loading}
            onChange={this.handleTableChange}
            pagination={paginationProps}
          />
          <Modal
            title='添加账号'
            visible={addModalVisible}
            destroyOnClose
            onCancel={() => {
              this.handleModalVisible('addModalVisible', false);
            }}
            onOk={this.handleAddCustom}
            confirmLoading={submitting}
          >
            <FormItem 
              labelCol={{ span: 5 }} 
              wrapperCol={{ span: 19 }} 
              label='单位名称' 
              style={{marginBottom: 16}}
            >
              <Select
                showSearch
                placeholder='请选择'
                style={{width: '100%'}}
                notFoundContent={contractFetch? <Spin size='small'/>: null}
                filterOption={false}
                onChange={this.handleContractChange}
                onSearch={debounce(this.handleContractFilter,500)}
              >
                {
                  contracts.map(c => <Option key={c.id} value={c.id}>{c.companyName}</Option>)
                }
              </Select>
            </FormItem>
            {
              idFetch ? 
              <Spin size='small'/> : 
              currentContract && 
              <Fragment>
                <FormItem 
                  labelCol={{ span: 5 }} 
                  wrapperCol={{ span: 19 }} 
                  label='房间号' 
                  style={{marginBottom: 16}}
                >
                  { currentContract.roomList.map(item => <Tag key={item.id}>{item.roomName}</Tag>) }
                </FormItem>
                <FormItem 
                  labelCol={{ span: 5 }} 
                  wrapperCol={{ span: 19 }} 
                  label='合同日期' 
                  style={{marginBottom: 16}}
                >
                  { `${moment(currentContract.startTime).format('YYYY-MM-DD')} ~ ${moment(currentContract.endTime).format('YYYY-MM-DD')}` }
                </FormItem>
              </Fragment>
            }
          </Modal>
          <Modal
            title='预收'
            visible={advModalVisible}
            destroyOnClose
            onCancel={() => {
              this.handleModalVisible('advModalVisible', false);
            }}
            onOk={this.handleAdv}
            confirmLoading={submitting}
          >
            <FormItem 
              labelCol={{ span: 5 }} 
              wrapperCol={{ span: 19 }} 
              label='单位名称'
              className={styles.stepFormText} 
            >
              {updateValues ? updateValues.accountName : ''}
            </FormItem>
            <FormItem 
              labelCol={{ span: 5 }} 
              wrapperCol={{ span: 19 }} 
              label='合同日期' 
              className={styles.stepFormText}
            >
              {updateValues ? <Fragment>{moment(updateValues.startTime).format('YYYY-MM-DD')} <span style={{color: '#999'}}>~</span> {moment(updateValues.endTime).format('YYYY-MM-DD')}</Fragment> : ''}
            </FormItem>
            <Divider style={{ margin: '24px 0' }} />
            <FormItem 
              labelCol={{ span: 5 }} 
              wrapperCol={{ span: 19 }} 
              label='预收金额' 
            >
              {
                getFieldDecorator('advance')(
                  <InputNumber min={0} step={10}/>
                )
              }
            </FormItem>
            <FormItem 
              labelCol={{ span: 5 }} 
              wrapperCol={{ span: 19 }} 
              label='预收日期' 
            >
              {
                getFieldDecorator('advDate', {
                  initialValue: moment(Date.now())
                })(
                  <DatePicker/>
                )
              }
            </FormItem>
            <FormItem 
              labelCol={{ span: 5 }} 
              wrapperCol={{ span: 19 }} 
              label='备注' 
            >
              {
                getFieldDecorator('remark')(
                  <TextArea placeholder='请输入'/>
                )
              }
            </FormItem>
          </Modal>
          <Modal
            title='扣款'
            visible={advPayModalVisible}
            destroyOnClose
            onCancel={() => {
              this.handleModalVisible('advPayModalVisible', false);
            }}
            onOk={this.handleAdvPay}
            confirmLoading={submitting}
          >
            <FormItem 
              labelCol={{ span: 5 }} 
              wrapperCol={{ span: 19 }} 
              label='单位名称'
              className={styles.stepFormText} 
            >
              {updateValues ? updateValues.accountName : ''}
            </FormItem>
            <FormItem 
              labelCol={{ span: 5 }} 
              wrapperCol={{ span: 19 }} 
              label='合同日期' 
              className={styles.stepFormText}
            >
              {updateValues ? <Fragment>{moment(updateValues.startTime).format('YYYY-MM-DD')} <span style={{color: '#999'}}>~</span> {moment(updateValues.endTime).format('YYYY-MM-DD')}</Fragment> : ''}
            </FormItem>
            <Divider style={{ margin: '24px 0' }} />
            <FormItem 
              labelCol={{ span: 5 }} 
              wrapperCol={{ span: 19 }} 
              label='扣款金额' 
            >
              {
                getFieldDecorator('debit')(
                  <InputNumber min={0} step={10}/>
                )
              }
            </FormItem>
            <FormItem 
              labelCol={{ span: 5 }} 
              wrapperCol={{ span: 19 }} 
              label='扣款日期' 
            >
              {
                getFieldDecorator('debitDate', {
                  initialValue: moment(Date.now())
                })(
                  <DatePicker/>
                )
              }
            </FormItem>
            <FormItem 
              labelCol={{ span: 5 }} 
              wrapperCol={{ span: 19 }} 
              label='备注' 
            >
              {
                getFieldDecorator('remark')(
                  <TextArea placeholder='请输入'/>
                )
              }
            </FormItem>
          </Modal>
          <Modal
            title='预收明细'
            visible={advDModalVisible}
            destroyOnClose
            onCancel={() => {
              this.handleModalVisible('advDModalVisible', false);
            }}
            onOk={() => {
              this.handleModalVisible('advDModalVisible', false);
            }}
          >
            { 
              detailFetch ? 
              <Spin size='default'/> :
              <Fragment>
                <Alert 
                  type='info'
                  message={updateValues ? <b>{updateValues.accountName}</b> : ''} 
                  showIcon 
                  style={{
                    marginBottom: 24
                  }}
                />
                {
                  detail.length > 0 ? 
                  <Timeline style={{backgroundColor: '#fafafa', padding:'24px 15px', borderRadius:4}}>
                    {
                      detail.map((item, index) => 
                        <TimelineItem 
                          color={index==0 ? 'green' : '#bbb'} 
                          key={item.id}
                          style={{
                            color: index==0 ? '#666' : '#bbb' 
                          }}
                        >
                          <p style={{marginBottom:0}}>日　　期：{moment(item.advDate).format('YYYY-MM-DD')}</p>
                          <p style={{marginBottom:0}}>预收金额：<b style={{fontSize: 18, fontWeight: 500, color: index == 0 && '#1890ff'}}>{item.advance}</b> 元</p>
                          {item.roomNumber ? <p style={{marginBottom:0}}>房　　间：{item.roomNumber}</p> : ''}
                          {item.remark ? <p style={{marginBottom:0}}>备　　注：{item.remark}</p> : ''}
                        </TimelineItem>
                      )
                    }
                  </Timeline> :
                  '暂无明细'
                }
              </Fragment>
            }
          </Modal>

          <Modal
            title='扣款明细'
            visible={advDPModalVisible}
            destroyOnClose
            onCancel={() => {
              this.handleModalVisible('advDPModalVisible', false);
            }}
            onOk={() => {
              this.handleModalVisible('advDPModalVisible', false);
            }}
          >
            { 
              surDetailFetch ? 
              <Spin size='default'/> :
              <Fragment>
                <Alert 
                  type='info'
                  message={updateValues ? <b>{updateValues.accountName}</b> : ''} 
                  showIcon 
                  style={{
                    marginBottom: 24
                  }}
                />
                {
                  surDetail.length > 0 ? 
                  
                    <Timeline style={{backgroundColor: '#fafafa', padding:'24px 15px', borderRadius:4}}>
                      {
                        surDetail.map((item, index) => 
                          <TimelineItem 
                            color={index==0 ? 'green' : '#bbb'} 
                            key={item.id}
                            style={{
                              color: index==0 ? '#666' : '#bbb' 
                            }}
                          >
                            <p style={{marginBottom:0}}>日　　期：{moment(item.debitDate).format('YYYY-MM-DD')}</p>
                            <p style={{marginBottom:0}}>扣款金额：<b style={{fontSize: 18, fontWeight: 500, color: index == 0 && '#1890ff'}}>{item.debit}</b> 元</p>
                            {item.roomNumber ? <p style={{marginBottom:0}}>房　　间：{item.roomNumber}</p> : ''}
                            {item.remark ? <p style={{marginBottom:0}}>备　　注：{item.remark}</p> : ''}
                          </TimelineItem>
                        )
                      }
                    </Timeline> :
                  '暂无明细'
                }
              </Fragment>
            }
          </Modal>
        </Card>
      </Fragment>
    )
  }
}
