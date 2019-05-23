import { isUrl, checkPermission } from '../utils/utils';

const menuData = [
  {
    name: 'Dashboard',
    icon: 'dashboard',
    path: 'dashboard',
    children: [
      {
        name: '统计',
        path: 'analysis',
        authority: checkPermission('1692')
      }
    ],
  },
  {
    name: '业务管理',
    icon: 'profile',
    path: 'business',
    children: [
      {
        name: '合同管理',
        path: 'contract',
        authority: checkPermission('9')
      },
      {
        name: '报修管理',
        path: 'repair',
        authority: checkPermission('23')
      }
    ]
  },
  {
    name: '基础数据',
    icon: 'database',
    path: 'base',
    children: [
      /* {
        name: '区块管理',
        path: 'area'
      }, */
      {
        name: '楼层管理',
        path: 'floor',
        authority: checkPermission('7')
      },
      {
        name: '房间管理',
        path: 'room',
        authority: checkPermission('8')
      }
    ]
  },
  {
    name: '水电管理',
    icon: 'table',
    path: 'energy',
    children: [
      /* {
        name: '水费管理',
        path: 'water',
        children: [
           {
             name:'写字楼',
             path: 'office'
           },
           {
             name: '仓库',
             path: 'warehouse'
           },
           {
             name: '二期',
             path: 'phaseII'
           }
        ]
      },
      {
        name: '电费管理',
        path: 'electricity',
        children: [
          {
            name:'写字楼',
            path: 'office'
          },
          {
            name: '仓库',
            path: 'warehouse'
          },
          {
            name: '二期',
            path: 'phase'
          }
       ]
      }, */
      {
        name: '水表设置',
        path: 'set-water',
        authority: checkPermission('11')
      },
      {
        name: '电表设置',
        path: 'set-ele',
        authority: checkPermission('16')
      }/* ,
      {
        name: '水电统计',
        path: 'statistical',
      } */
    ]
  },
  {
    name: '费收管理',
    icon: 'pay-circle-o',
    path: 'cost',
    children: [
      {
        name: '费用预收',
        path: 'adv-pay',
        authority: checkPermission('22')
      },
      {
        name: '费用结算',
        path: 'clearing',
        authority: checkPermission('1691')
      }
    ]
  },
  {
    name: '权限管理',
    icon: 'safety',
    path: 'permission',
    children: [
      {
        name: '用户管理',
        path: 'custom',
        authority: checkPermission('2')
      },
      {
        name: '角色权限',
        path: 'role',
        authority: checkPermission('4')
      },
      {
        name: '资源管理',
        path: 'resource',
        authority: checkPermission('3')
      }
    ]
  }
];

function formatter(data, parentPath = '/', parentAuthority) {
  return data.map(item => {
    let { path } = item;
    if (!isUrl(path)) {
      path = parentPath + item.path;
    }
    const result = {
      ...item,
      path,
      authority: item.authority || parentAuthority,
    };
    if (item.children) {
      result.children = formatter(item.children, `${parentPath}${item.path}/`, item.authority);
    }
    return result;
  });
}

export const getMenuData = () => formatter(menuData);
