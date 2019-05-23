import React, { Component, Fragment, PureComponent } from 'react';
import { 
  Card,
  Input,
  Tooltip,
  Tree,
  Spin,
  Form,
  Button,
  message,
  Modal,
  TreeSelect,
  Icon
} from 'antd';
import { connect } from 'dva';
import styles from './index.less';
import find from 'lodash/find';
import flattenDeep from 'lodash/flattenDeep';
import { Select } from 'antd';

const FormItem = Form.Item;
const TreeNode = Tree.TreeNode;
const TreeSelectNode = TreeSelect.TreeNode;

function getCheckedKeys(trees, authKeys) {
  return trees.map(tree => {
    if(tree.children && tree.children.length >0) {
      return getCheckedKeys(tree.children, authKeys)
    }
    return authKeys.filter(a => tree.id === a)
  })
}

@connect(({ resource, loading }) => ({
    resource,
    loading: loading.models.resource,
    confirmLoading: loading.effects['resource/cud'],
    treeLoading: loading.effects['resource/fetchTree'],
    fetchInfo: loading.effects['resource/fetchTreeById']
}))
@Form.create()
export default class Role extends Component {
  state = {
    selectedKey:'',
    current:{}
  }

  getTree() {
    this.props.dispatch({
      type: 'resource/fetchTree'
    });
  }

  

  componentDidMount() {
    this.getTree()
  }

  handleEdit = (values, type) => {
    const { form } = this.props;
    this.props.dispatch({
      type: 'resource/cud',
      operateName: type,
      payload: values,
      callback: () => {
       this.getTree();
       this.setState({
         current: {}
       })
      }
    });
    
  }

  handleAdd = () => {
    this.setState({
      current: {}
    });
  }

  handleSave = () => {
    const { form } = this.props;
    const { current } = this.state;
    form.validateFields((err, values) => {
      if(err) return;
      this.handleEdit(values, ( 'menuId' in current) ? 'edit' : 'add');
    })
  }

  handleDelete = id => {
    if(!id) {
      return message.error('请先选择需要删除的资源')
    }
    Modal.confirm({
      title: '提示',
      icon: 'warning',
      content: <span>删除资源可能会导致帐号的<b>相关权限失效</b>，请谨慎操作</span>,
      okText: '删除',
      cancelText: '取消',
      onOk: () => this.handleEdit({id}, 'delete')
    })
  }

  handleTreeSelected = selectedKeys => {
    const selectedKey = selectedKeys[0];
    if(!selectedKey) return;
    this.props.dispatch({
      type: 'resource/fetchTreeById',
      payload: selectedKey,
      callback: current => {
        this.setState({
          current
        });
      }
    });
    this.setState({
      selectedKey
    });
  }

  

  renderTree() {
    const { resource:{tree}, treeLoading } = this.props;
    const genTreeNode = treeData => {
      return treeData.map(item => {
        if (item.children && item.children.length ) {
          return (
            <TreeNode 
              key={item.id} 
              title={item.name}
            >
              { genTreeNode(item.children) }
            </TreeNode>
          ) 
        }
        return (
          <TreeNode 
            key={item.id} 
            title={item.name}
          />
        )
      })
    }
    return (
      treeLoading ? 
      <div className={styles.roleCenter}><Spin/></div> :
      <Tree
        blockNode
        onSelect={this.handleTreeSelected}
      >
        {genTreeNode(tree)}
      </Tree>
    )
  }
  renderTreeSelect() {
    const { resource:{tree} } = this.props;
    const genTreeNode = treeData => {
      return treeData.map(item => {
        if (item.children && item.children.length ) {
          return (
            <TreeSelectNode 
              key={item.id} 
              title={item.name}
              value={item.id}
            >
              { genTreeNode(item.children) }
            </TreeSelectNode>
          ) 
        }
        return (
          <TreeSelectNode 
            key={item.id} 
            title={item.name}
            value={item.id}
          />
        )
      })
    }
    return (
      <TreeSelect
        blockNode
        allowClear
        dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
      >
        <TreeSelectNode 
          key='-1'
          title='顶级资源'
          value='-1'
        />
        {genTreeNode(tree)}
      </TreeSelect>
    )
  }
  render() {
    const { selectedKey, current } = this.state;
    const { confirmLoading, form, fetchInfo } = this.props;
    return (
      <Card className={styles.roleContainer} bodyStyle={{padding:0, height:'100%', width: '100%', display:'flex'}}>
        <div className={styles.roleList}>
          <h2 className={styles.roleTitle}>
            <span>资源列表</span>
            <div className={styles.roleAction}>
              <Tooltip title='添加资源'>
                <Icon type='plus' onClick={() => this.handleAdd()} className={styles.roleButton}/>
              </Tooltip>
              <Tooltip title='删除资源'>
                <Icon type='delete' onClick={() => this.handleDelete(selectedKey)} className={styles.roleButton} theme='filled'/>
              </Tooltip>
            </div>
          </h2>
          {this.renderTree()}
        </div>
        <div className={styles.roleContent}>
          <h2 className={styles.roleTitle}>
            <span>资源信息</span>
            <div className={styles.roleAction}>
              <Button size='small' type='primary' onClick={() => this.handleSave()} loading={confirmLoading} >保存</Button>
            </div>
          </h2>
          <div className={styles.resourceForm}>
            {
              fetchInfo ?
              <div className={styles.roleCenter}><Spin/></div> :
              <Form>
                <FormItem labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} label='资源ID'>
                  {form.getFieldDecorator('menuId', {
                    initialValue: current ? current.menuId : ''
                  })(<Input disabled/>)}
                </FormItem>
                <FormItem labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} label='资源名称'>
                  {form.getFieldDecorator('name', {
                    rules: [{ required: true, message: '请输入资源名称' }],
                    initialValue: current ? current.name : ''
                  })(<Input placeholder='请输入'/>)}
                </FormItem>
                <FormItem labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} label='资源类型'>
                  {form.getFieldDecorator('type', {
                    rules: [{ required: true, message: '请选择资源类型' }],
                    initialValue: current ? current.type : '0'
                  })(
                    <Select placeholder='请选择'>
                      <Option value='0'>菜单</Option>
                      <Option value='1'>按钮</Option>
                    </Select>
                  )}
                </FormItem>
                <FormItem labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} label='父级资源'>
                  {form.getFieldDecorator('parentId', {
                    rules: [{ required: true, message: '请选择父级资源' }],
                    initialValue: current ? current.parentId : '-1'
                  })(this.renderTreeSelect())}
                </FormItem>
              </Form>
            }
          </div>
        </div>
      </Card>
    )
  }
}