import React, { Component, Fragment, PureComponent } from 'react';
import { 
  Card,
  Input,
  Tooltip,
  Tree,
  Spin,
  Form,
  Button,
  Modal,
  Icon
} from 'antd';
import { connect } from 'dva';
import styles from './index.less';
import find from 'lodash/find';
import flattenDeep from 'lodash/flattenDeep';

const FormItem = Form.Item;
const TreeNode = Tree.TreeNode;

function getCheckedKeys(trees, authKeys) {
  return trees.map(tree => {
    if(tree.children && tree.children.length >0) {
      return getCheckedKeys(tree.children, authKeys)
    }
    return authKeys.filter(a => tree.id === a)
  })
}

@connect(({ role, loading }) => ({
    role,
    loading: loading.models.role,
    confirmLoading: loading.effects['role/cud'],
    treeLoading: loading.effects['role/fetchTree']
}))
@Form.create()
export default class Role extends Component {
  state = {
    modalVisible: false,
    roleId: '',
    roleIds: [],
    half: [],
    currentRole:{}
  }

  getRoleList(callback) {
    this.props.dispatch({
      type: 'role/fetch',
      callback
    });
  }

  setRoleId(current) {
    const checkedKeys = getCheckedKeys(this.props.role.tree, current.menuList ? current.menuList.map(item=>item.menuId) : []);
    this.setState({roleId: current['roleId']+'', roleIds:current.menuList ? flattenDeep(checkedKeys) : []});
  }

  componentDidMount() {
    this.getRoleList(data => {
      this.setRoleId(data[0])
    });
    this.props.dispatch({
      type: 'role/fetchTree'
    })
  }

  handleModalVisible = (flag, values) => {
    const currentRole = find(this.props.role.list, {roleId: +values});
    this.setState({
      modalVisible: !!flag,
      currentRole
    });
  }

  handleEdit = (values, type) => {
    this.props.dispatch({
      type: 'role/cud',
      operateName: type,
      payload: {
        ...values
      },
      callback: () => {
        this.handleModalVisible();
        if(type == 'add') {
          this.getRoleList(data => {
            let current = data[data.length-1];
            this.setRoleId(current)
          })
        } else if(type == 'delete') {
          this.getRoleList(data => {
            let current = data[0];
            this.setRoleId(current)
          })
        } else {
          this.getRoleList()
        }
      }
    });
    
  }

  handleOk = () => {
    const { form } = this.props;
    const { currentRole, roleIds} = this.state;
    const submitRole = currentRole ? {
      roleId:currentRole.roleId, 
      roleName:currentRole.roleName,
      roleCode:currentRole.roleCode, 
      roleDesc:currentRole.roleDesc, 
    }: {};
    form.validateFields((err, values) => {
      if (err) return;
      this.handleEdit({...submitRole, menuId:currentRole ? roleIds : [], ...values}, this.state.currentRole ? 'edit' : 'add');
    });
  }

  handleDelete = id => {
    Modal.confirm({
      title: '提示',
      icon: 'warning',
      content: <span>删除角色会导致帐号的<b>权限失效</b>，请谨慎操作</span>,
      okText: '删除',
      cancelText: '取消',
      onOk: () => this.handleEdit({id}, 'delete')
    })
  }

  handleRoleListSelect = selectedKeys => {
    const roleId = selectedKeys[0];
    const currentRole = find(this.props.role.list, {roleId: +roleId});
    if(!roleId) return;
    const checkedKeys = flattenDeep(getCheckedKeys(this.props.role.tree,currentRole['menuList'] ? currentRole['menuList'].map(item=>item.menuId) : []));
    this.setState({
      roleId: selectedKeys[0],
      roleIds: checkedKeys
    })
  }

  handleOuthCheck = (checkedKeys, info) => {
    const roleIds = [...checkedKeys];
    const { halfCheckedKeys:half } = info;
    this.setState({roleIds, half})
  }

  handleSaveOuth = () => {
    const { roleId, roleIds, half} = this.state;
    const menuId = [...roleIds, ...half];
    this.handleEdit({roleId, menuId}, 'edit');
  }

  async codeValidator(rule, value, callback) {
    callback()
  }

  renderTree() {
    const { role:{tree}, treeLoading } = this.props;
    const { roleIds } = this.state
    const genTreeNode = treeData => {
      return treeData.map(item => {
        if (item.children && item.children.length ) {
          return (
            <TreeNode 
              key={item.id} 
              title={item.name}
              selectable={false}
            >
              { genTreeNode(item.children) }
            </TreeNode>
          ) 
        }
        return (
          <TreeNode 
            key={item.id} 
            title={item.name}
            className={styles.isLast}
            selectable={false}
          />
        )
      })
    }
    return (
      treeLoading ? 
      <div className={styles.roleCenter}><Spin/></div> :
      <Tree
        checkable
        blockNode
        className={styles.outhTree}
        checkedKeys={roleIds}
        onCheck={this.handleOuthCheck}
      >
        {genTreeNode(tree)}
      </Tree>
    )
  }
  render() {
    const { role:{list}, loading, form, confirmLoading } = this.props;
    const { modalVisible, roleId, currentRole } = this.state;
    return (
      <Card className={styles.roleContainer} bodyStyle={{padding:0, height:'100%'}}>
        <div className={styles.roleList}>
          <h2 className={styles.roleTitle}>
            <span>角色列表</span>
            <div className={styles.roleAction}>
              <Tooltip title='添加角色'>
                <Icon type='plus' onClick={() => this.handleModalVisible(true)} className={styles.roleButton}/>
              </Tooltip>
              <Tooltip title='编辑角色'>
                <Icon type='edit' onClick={() => this.handleModalVisible(true,roleId)} className={styles.roleButton}/>
              </Tooltip>
              <Tooltip title='删除角色'>
                <Icon type='delete' onClick={() => this.handleDelete(roleId)} className={styles.roleButton} theme='filled'/>
              </Tooltip>
            </div>
          </h2>
          { 
            loading ?
            <div className={styles.roleCenter}><Spin/></div> :
            !list.length ? 
            <div className={styles.roleCenter}>
              <div className='ant-empty ant-empty-normal'>
                <div className='ant-empty-image'>
                  <img alt='暂无数据' src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNDEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMCAxKSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KICAgIDxlbGxpcHNlIGZpbGw9IiNGNUY1RjUiIGN4PSIzMiIgY3k9IjMzIiByeD0iMzIiIHJ5PSI3Ii8+CiAgICA8ZyBmaWxsLXJ1bGU9Im5vbnplcm8iIHN0cm9rZT0iI0Q5RDlEOSI+CiAgICAgIDxwYXRoIGQ9Ik01NSAxMi43Nkw0NC44NTQgMS4yNThDNDQuMzY3LjQ3NCA0My42NTYgMCA0Mi45MDcgMEgyMS4wOTNjLS43NDkgMC0xLjQ2LjQ3NC0xLjk0NyAxLjI1N0w5IDEyLjc2MVYyMmg0NnYtOS4yNHoiLz4KICAgICAgPHBhdGggZD0iTTQxLjYxMyAxNS45MzFjMC0xLjYwNS45OTQtMi45MyAyLjIyNy0yLjkzMUg1NXYxOC4xMzdDNTUgMzMuMjYgNTMuNjggMzUgNTIuMDUgMzVoLTQwLjFDMTAuMzIgMzUgOSAzMy4yNTkgOSAzMS4xMzdWMTNoMTEuMTZjMS4yMzMgMCAyLjIyNyAxLjMyMyAyLjIyNyAyLjkyOHYuMDIyYzAgMS42MDUgMS4wMDUgMi45MDEgMi4yMzcgMi45MDFoMTQuNzUyYzEuMjMyIDAgMi4yMzctMS4zMDggMi4yMzctMi45MTN2LS4wMDd6IiBmaWxsPSIjRkFGQUZBIi8+CiAgICA8L2c+CiAgPC9nPgo8L3N2Zz4K'/>
                </div>
                <p className='ant-empty-description'>暂无数据</p>
              </div>
            </div>:
            <Tree
              blockNode
              showIcon
              selectedKeys={[roleId]}
              onSelect={this.handleRoleListSelect}
            >
              {
                list.map(item => <TreeNode icon={<Icon type='file-protect' />} title={item.roleName} key={item.roleId}/>)
              }
            </Tree>
          }
        </div>
        <div className={styles.roleContent}>
          <h2 className={styles.roleTitle}>
            <span>权限列表</span>
            <div className={styles.roleAction}>
              <Button size='small' type='primary' loading={confirmLoading} onClick={this.handleSaveOuth}>保存</Button>
            </div>
          </h2>
          {this.renderTree()}
        </div>
        <Modal
          title={currentRole ? '编辑角色' : '添加角色'}
          visible={modalVisible}
          onOk={this.handleOk}
          confirmLoading={confirmLoading}
          destroyOnClose
          onCancel={() => this.handleModalVisible()}
        >
          <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 19 }} label='角色名称'>
            {form.getFieldDecorator('roleName', {
              rules: [{ required: true, message: '请输入角色名称' }],
              initialValue: currentRole ? currentRole.roleName : ''
            })(<Input placeholder='请输入'/>)}
          </FormItem>
          <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 19 }} label='角色代码'>
            {form.getFieldDecorator('roleCode', {
              rules: [{ required: true, message: '请输入角色代码' },{validator: this.codeValidator}],
              initialValue: currentRole ? currentRole.roleCode : ''
            })(<Input placeholder='请输入'/>)}
          </FormItem>
          <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 19 }} label='角色描述'>
            {form.getFieldDecorator('roleDesc', {
              rules: [{ required: true, message: '请输入角色描述' }],
              initialValue: currentRole ? currentRole.roleDesc : ''
            })(<Input placeholder='请输入' />)}
          </FormItem>
        </Modal>
      </Card>
    )
  }
}