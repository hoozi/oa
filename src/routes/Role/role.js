import React, { Component, Fragment, PureComponent } from 'react';
import { 
    Card,
    Divider,
    Popconfirm,
    Button,
    Input,
    Icon,
    Table,
    Tree,
    Spin,
    Form,
    Modal
} from 'antd';
import { connect } from 'dva';
import StandardTable from 'components/StandardTable';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import styles from '../List/BasicList.less';
import moment from 'moment';
import map from 'lodash/map';

const { Search } = Input;
const FormItem = Form.Item;
const TreeNode = Tree.TreeNode;

// 创建表单
const CreateFrom = Form.create(/* {
    mapPropsToFields(props){
        const { formValues } = props;
        const retFields = {};
        if(formValues.roleId) {
            Object.keys(formValues).forEach((key) => {
                retFields[key] = Form.createFormField({
                  value: formValues[key]
                })
            });
        }
        return retFields
    }
} */)(props => {
  const { modalVisible, form, handleEdit, handleNodeCheck, handleNodeSelect, handleModalVisible, treeData, confirmLoading, treeChecked=[1], formValues = {} } = props;
  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      form.resetFields();
      handleEdit({...formValues, ...fieldsValue}, formValues.roleId ? 'edit': 'add');
    });
  };
  const genTree = treeData => {
    return treeData.map(tree => {
        if (tree.children) {
            return (
                <TreeNode 
                    key={tree.id} 
                    title={tree.name}>
                    { genTree(tree.children) }
                </TreeNode>
            ) 
        }
        return <TreeNode 
                key={tree.id} 
                title={tree.name}
            />
    })
  }
  const validateEN = (rule, value, callback) => {
    if (value && !/\w+/.test(value)) {
      callback('角色代码必须是英文或者数字');
    } else {
      callback();
    }
  }
  return (
    <Modal
      title={formValues.roleId ? '编辑角色': '新增角色'}
      visible={modalVisible}
      onOk={okHandle}
      destroyOnClose={true}
      confirmLoading={confirmLoading}
      onCancel={() => handleModalVisible()}
    >
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="角色名称">
        {form.getFieldDecorator('roleName', {
          rules: [{ required: true, message: '请输入角色名称' }],
          initialValue: formValues ? formValues.roleName : ''
        })(<Input placeholder="请输入角色名称"/>)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="角色代码">
        {form.getFieldDecorator('roleCode', {
          rules: [
              { required: true, message: '请输入角色的英文代码' },{validator: validateEN}],
          initialValue: formValues ? formValues.roleCode : ''
        })(<Input placeholder="请输入角色的英文代码"/>)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="角色描述">
        {form.getFieldDecorator('roleDesc', {
          rules: [{ required: true, message: '请输入角色描述' }],
          initialValue: formValues ? formValues.roleDesc : ''
        })(<Input placeholder="请输入角色描述" />)}
      </FormItem>
      
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="权限设置">
        {treeData ? <Tree 
            checkable 
            checkedKeys={treeChecked}
            onCheck={handleNodeCheck}
            onSelect={handleNodeSelect}
            blockNode
            >
            {genTree(treeData)}
        </Tree> : <Spin/>}
      </FormItem>
    </Modal>
  );
})

@connect(({ role, loading }) => ({
    role,
    loading: loading.models.role
}))
export default class Role extends Component {
    state = {
        treeChecked: [],
        formValues: {},
        confirmLoading: false,
        modalVisible: false
    }

    /**
     * fetch数据
     * @param {Object} payload 查询参数 
     */
    _fetch(payload={}) {
        this.props.dispatch({
            type: 'role/fetch',
            payload
        })
    } 
    
    componentDidMount() {
        this._fetch();
        this.props.dispatch({
            type: 'role/fetchTree'
        })
    }

    handleSearch = () => {
        this._fetch();
    }
    handlePageChange = () => {
        this._fetch()
    }

    handleModalVisible = (flag, values) => {
        this.setState({
            modalVisible: !!flag,
            formValues: values ? values: {},
            treeChecked: values ? map(values.menuList, 'menuId') : []
        });
    }
    handleDelete = (id) => {
        this.props.dispatch({
            type: 'role/cud',
            operateName: 'delete',
            payload: { id }
        })
    }
    handleEdit = (values, type) => {
        this.props.dispatch({
            type: 'role/cud',
            operateName: type,
            payload: {
                ...values,
                menuId: this.state.treeChecked
            }
        })
        if(type === 'add') {
            this.setState({
                treeChecked: []
            })
        } else if (type === 'edit') {
            this.handleModalVisible()
        }
    }
    handleNodeCheck = (checkedKeys, e) => {
        this.setState({
            treeChecked: checkedKeys
        })
    }
    handleNodeSelect = (selectedKeys, e) => {
        
    }

    render() {
        let { role: { list, tree }, loading } = this.props;
        let { modalVisible, formValues, confirmLoading } = this.state;
        let columns = [
            {
                title: '角色名称',
                dataIndex: 'roleName',
            },
            {
                title: '角色代码',
                dataIndex: 'roleCode',
            },
            {
                title: '角色描述',
                dataIndex: 'roleDesc',
            },
            {
                title: '更新时间',
                dataIndex: 'updateTime',
                render: val => val ? moment(val).format('YYYY-MM-DD hh:mm:ss') : '-'
            },
            {
                title: '操作',
                render: (text, record, index) => {
                    return (
                        <Fragment>
                            <a href="javascript:;" onClick={() => {this.handleModalVisible(true, record)}}>编辑</a>
                            <Divider type="vertical" />
                            {/* <a href="javascript:;">权限</a>
                            <Divider type="vertical" /> */}
                            <Popconfirm title="确定要删除这个角色吗?" onConfirm={()=>{
                                this.handleDelete(record.roleId)
                            }}>
                                <a href="javascript:;" style={{color: '#f5222d'}}>删除</a>
                            </Popconfirm>
                        </Fragment>
                    )
                }
            }
        ]
        let extraContent = (
            <div className={styles.extraContent}>
              <Search 
                className={styles.extraContentSearch} 
                placeholder="请输入角色名称" 
                onSearch={this.handleSearch} />
            </div>
          );
        let parentMethods = {
            handleEdit: this.handleEdit,
            handleModalVisible: this.handleModalVisible,
            handleNodeCheck: this.handleNodeCheck,
            handleNodeSelect: this.handleNodeSelect,
        };
       
        return (
            <PageHeaderLayout>
                <div className={styles.standardList}>
                    <Card 
                        className={styles.listCard}
                        bordered={false}
                        title={
                            <Fragment>    
                                <Button type="primary" onClick={() => {this.handleModalVisible(true)}}><Icon type="plus"/>新增角色</Button>
                            </Fragment>
                        }
                        style={{ marginTop: 24 }}
                        bodyStyle={{ padding: '0 32px 40px 32px' }}
                        extra={extraContent}
                    >
                        <Table
                            rowKey = {(r) => r.roleId}
                            columns={columns}
                            bordered={true}
                            size='middle'
                            loading={loading}
                            dataSource={list}
                        />
                    </Card>
                </div>
                
                <CreateFrom {...parentMethods} 
                    modalVisible={modalVisible} 
                    formValues={formValues} 
                    treeData={tree}
                    confirmLoading={confirmLoading}
                    treeChecked={this.state.treeChecked}
                />
            </PageHeaderLayout>
        )
    }
}