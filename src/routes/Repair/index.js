import React, { Component } from 'react';
import { 
  Select,
  Form,
  Row,
  Col,
  Input,
  Button,
  Badge,
  Icon,
  Rate,
  Table,
  Divider,
  Tag,
  Popconfirm,
  Card,
  Modal
} from 'antd';
import { connect } from 'dva';
import isEmpty from 'lodash/isEmpty';
import { stringify } from 'qs';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import StandardFormRow from 'components/StandardFormRow';
import styles from './index.less';
import cardList from '../List/CardList.less';

const FormItem = Form.Item;
const Option = Select.Option;
const formItemLayout = {
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 24 },
    md: { span: 12 },
  },
};

const modalFormItemLayout = {
  labelCol: { span: 5, offset: 0},
  wrapperCol: { span: 19 }
};

const CreateModal = Form.create()(props => {
  const { form, handleSave, currentData, handleModalVisible, modalVisible, confirmLoading } = props;
  const getFieldDecorator = form.getFieldDecorator;
  const handleOk = () => {
    form.validateFields((err, values) => {
      if(err) return;
      handleSave && handleSave(values, currentData)
    })
  }
  return (
    <Modal
      title={isEmpty(currentData) ? '新增报修' : '编辑报修'}
      visible={modalVisible}
      onCancel={() => handleModalVisible()}
      onOk={handleOk}
      confirmLoading={confirmLoading}
      destroyOnClose
    >
      <Form className={styles.modalForm}>
        <FormItem label='报修人' {...modalFormItemLayout}>
          {
            getFieldDecorator('repairMan', {
              rules: [
                {
                  required: true,
                  message: '请输入报修人'
                }
              ],
              initialValue: currentData ? currentData.repairMan : ''
            })(
              <Input placeholder='请输入'/>
            )
          }
        </FormItem>
        <FormItem label='联系电话' {...modalFormItemLayout}>
          {
            getFieldDecorator('tel', {
              rules: [
                {
                  required: true,
                  message: '请输入联系电话'
                }
              ],
              initialValue: currentData ? currentData.tel : ''
            })(
              <Input placeholder='请输入'/>
            )
          }
        </FormItem>
        <FormItem label='设备地址' {...modalFormItemLayout}>
          {
            getFieldDecorator('address', {
              rules: [
                {
                  required: true,
                  message: '请输入设备地址'
                }
              ],
              initialValue: currentData ? currentData.address : ''
            })(
              <Input placeholder='请输入'/>
            )
          }
        </FormItem>
        <FormItem label='报修内容' {...modalFormItemLayout}>
          {
            getFieldDecorator('content', {
              rules: [
                {
                  required: true,
                  message: '请输入报修内容'
                }
              ],
              initialValue: currentData ? currentData.content : ''
            })(
              <Input.TextArea placeholder='请输入'/>
            )
          }
        </FormItem>
      </Form>
    </Modal>
  )
})

@connect(({ repair, loading }) => ({
  repair,
  adding: loading.effects['repair/addRepair'],
  loading: loading.effects['repair/fetch'],
  submitting: loading.effects['repair/put']
}))
export default class Repair extends Component {
  state = {
    searchValue: {
      tel: '',
      status: ''
    },
    modalVisible: false,
    currentRow:{}
  }
  componentDidMount() {
    this.getRepair();
  }
  getRepair(params) {
    const payload = {
      current: 1,
      ...this.state.searchValue,
      ...params
    }
    this.props.dispatch({
      type: 'repair/fetch',
      payload
    })
  }
  handleFormChange = (value, name) => {
    this.setState({
      searchValue: {
        ...this.state.searchValue,
        [name]: value
      }
    });
  }
  handleRepairSearch = () => {
    this.getRepair();
  }
  handleResetSearch = () => {
    const searchValue = {};
    this.setState({ searchValue });
  }
  handleTableChange = pagination => {
    const { current, pageSize: size } = pagination;
    const { searchValue: { tel, status  }} = this.state;
    this.getRepair({ current, tel, status, size });
  }
  handleSave = (values, currentData) => {
    const type = `repair/${isEmpty(currentData) ? 'addRepair' : 'putRepair'}`;
    const payload = {...currentData, ...values}
    this.props.dispatch({
      type,
      payload,
      callback: () => {
        this.handleModalVisible();
        this.getRepair(isEmpty(currentData) ? {current: 1, size: 15} : {});
      }
    })
    /* this.handleAdd(payload) :
    this.handleUpdateRepair({...currentData, ...payload}) */
  }
  handleDelete = id => {
    this.props.dispatch({
      type: 'repair/deleteRepair',
      payload: id,
      callback: () => {
        this.getRepair();
      }
    })
  }
  handleModalVisible = (flag, row) => {
    this.setState({
      modalVisible: !!flag,
      currentRow: row ? row : {}
    })
  }
  handleExport = () => {
    const { searchValue } = this.state;
    const query = stringify({...searchValue});
    window.open(`/api/repair/excel?${query}`);
  }
  render() {
    const { searchValue: { tel, status }, modalVisible, currentRow } = this.state;
    const { loading, submitting, repair: { page: { records, current,  total } }, adding } = this.props;
    const paginationProps = {
      showQuickJumper: true,
      current,
      total
    }
    const columns = [
      {
        title: '报修人',
        dataIndex: 'repairMan'
      },
      {
        title: '联系方式',
        dataIndex: 'tel'
      },
      {
        title: '设备地址',
        dataIndex: 'address'
      },
      {
        title: '报修时间',
        dataIndex: 'time'
      },
      {
        title: '报修内容',
        dataIndex: 'content',
        width: 320
      },
      {
        title: '用户评价',
        dataIndex: 'grade',
        render: (value, row) => {
          return <div><Rate defaultValue={value} disabled/><div>{row.gradeContent}</div></div>
        }
      },
      {
        title: '当前进度',
        dataIndex: 'status',
        render: value => {
          const statusMap = {
            'GET': {
              'text': '已接受',
              'status': 'warning'
            },
            'SEND': {
              'text': '已派工',
              'status': 'processing'
            },
            'DONE': {
              'text': '已完成',
              'status': 'success'
            }
          }
          return <Badge {...statusMap[value]} />
        }
      },
      {
        title: '派工操作',
        dataIndex: '__',
        align: 'center',
        render: (value, row) => {
          const controlButton = {
            'GET': <Button onClick={() => this.handleSave({status: 'SEND'}, row)} loading={submitting}>确认派工</Button>,
            'SEND': <Button onClick={() => this.handleSave({status: 'DONE'},row)} type='primary' loading={submitting}>确认完成</Button>,
            'DONE': <Button disabled >已处理</Button>
          }
          return controlButton[row.status];
        }
      },
      {
        title: '操作',
        dataIndex: '_',
        render: (value, row) => (
          <React.Fragment>
            <a href='javascript:;' onClick={ () => { this.handleModalVisible(true, row) } }>编辑</a>
            <Divider type='vertical'/>
            <Popconfirm 
              title='确定删除这条记录吗？' 
              onConfirm={() => {this.handleDelete(row.id)}}
            >
              <a style={{ color: '#f5222d' }} href='javascript:;'>删除</a>
            </Popconfirm>
          </React.Fragment>
        )
      }
    ];
    const parentMethods = {
      handleSave: this.handleSave,
      handleModalVisible: this.handleModalVisible
    }
    return (
      <PageHeaderLayout>
        <Card bordered={false}>
          <Form>
            <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
              <Col md={8} sm={24}>
                <FormItem {...modalFormItemLayout} label="报修状态">
                  <Select 
                    placeholder='请选择' 
                    value={status} 
                    onChange={(value) => this.handleFormChange(value, 'status')}
                  >
                    <Option value="">全部</Option>
                    <Option value="GET">已接受</Option>
                    <Option value="SEND">已派工</Option>
                    <Option value="DONE">已完成</Option>
                  </Select>
                </FormItem>
              </Col>
              <Col md={8} sm={24}>
                <FormItem {...modalFormItemLayout} label="联系方式">
                  <Input 
                    placeholder='请输入' 
                    value={tel} 
                    onChange={(e) => this.handleFormChange(e.target.value, 'tel')}
                  />
                </FormItem>
              </Col>
              <Col md={8} sm={24}>
                <Button 
                  style={{marginRight: 8}}
                  type='primary' 
                  onClick={this.handleRepairSearch}
                >查询</Button>
                <Button 
                  onClick={this.handleResetSearch}>重置</Button>
              </Col>
            </Row>
          </Form>
        </Card>
        <Card style={{ marginTop: 24 }}>
          <div>
            <Button type='primary' style={{marginRight: 8}} onClick={() => this.handleModalVisible(true)}><Icon type='plus'/> 添加报修</Button>
            <Button icon="export" onClick={() => this.handleExport()}>导出报修</Button> 
          </div>
          <Table
            bordered
            columns={columns}
            rowKey={row => row.id}
            size="middle"
            dataSource={records}
            pagination={paginationProps}
            loading={loading}
            onChange={this.handleTableChange}
            style={{ marginTop: 16 }}
          />
        </Card>
        <CreateModal {...parentMethods} currentData={currentRow} confirmLoading={adding} modalVisible={modalVisible} />
      </PageHeaderLayout>
    )
  }
}