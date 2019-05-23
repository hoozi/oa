import { createElement } from 'react';
import dynamic from 'dva/dynamic';
import pathToRegexp from 'path-to-regexp';
import { getMenuData } from './menu';

let routerDataCache;

const modelNotExisted = (app, model) =>
  // eslint-disable-next-line
  !app._models.some(({ namespace }) => {
    return namespace === model.substring(model.lastIndexOf('/') + 1);
  });

// wrapper of dynamic
const dynamicWrapper = (app, models, component) => {
  // () => require('module')
  // transformed by babel-plugin-dynamic-import-node-sync
  if (component.toString().indexOf('.then(') < 0) {
    models.forEach(model => {
      if (modelNotExisted(app, model)) {
        // eslint-disable-next-line
        app.model(require(`../models/${model}`).default);
      }
    });
    return props => {
      if (!routerDataCache) {
        routerDataCache = getRouterData(app);
      }
      return createElement(component().default, {
        ...props,
        routerData: routerDataCache,
      });
    };
  }
  // () => import('module')
  return dynamic({
    app,
    models: () =>
      models.filter(model => modelNotExisted(app, model)).map(m => import(`../models/${m}.js`)),
    // add routerData prop
    component: () => {
      if (!routerDataCache) {
        routerDataCache = getRouterData(app);
      }
      return component().then(raw => {
        const Component = raw.default || raw;
        return props =>
          createElement(Component, {
            ...props,
            routerData: routerDataCache,
          });
      });
    },
  });
};

function getFlatMenuData(menus) {
  let keys = {};
  menus.forEach(item => {
    if (item.children) {
      keys[item.path] = { ...item };
      keys = { ...keys, ...getFlatMenuData(item.children) };
    } else {
      keys[item.path] = { ...item };
    }
  });
  return keys;
}

export const getRouterData = app => {
  const routerConfig = {
    '/': {
      component: dynamicWrapper(app, ['user', 'login'], () => import('../layouts/BasicLayout')),
    },
    '/dashboard/analysis': {
      component: dynamicWrapper(app, ['chart','room'], () => import('../routes/Dashboard/Analysis')),
    },/* ,
    '/dashboard/monitor': {
      component: dynamicWrapper(app, ['monitor'], () => import('../routes/Dashboard/Monitor')),
    },
    '/dashboard/workplace': {
      component: dynamicWrapper(app, ['project', 'activities', 'chart'], () =>
        import('../routes/Dashboard/Workplace')
      ),
      // hideInBreadcrumb: true,
      // name: '工作台',
      // authority: 'admin',
    }, */
    '/business/contract': {
      component: dynamicWrapper(app, ['chart','contract'], () => import('../routes/Contract'))
    },
    '/business/contract/officeBuildingA': {
      component: dynamicWrapper(app, ['contract'], () => import('../routes/Contract/ContractA'))
    },
    '/business/contract/officeBuildingB': {
      component: dynamicWrapper(app, ['contract'], () => import('../routes/Contract/ContractB'))
    },
    '/business/contract/warehouse': {
      component: dynamicWrapper(app, ['contract'], () => import('../routes/Contract/ContractWarehouse'))
    },
    '/business/contract/supporting': {
      component: dynamicWrapper(app, ['contract'], () => import('../routes/Contract/ContractSupporting'))
    },
    '/business/contract/phase2': {
      component: dynamicWrapper(app, ['contract'], () => import('../routes/Contract/ContractPhase2'))
    },
    '/business/repair': {
      component: dynamicWrapper(app, ['repair'], () => import('../routes/Repair'))
    },  
    '/base/floor': {
      component: dynamicWrapper(app, ['floor'], () => import('../routes/SetFloor'))
    },
    '/base/room': {
      component: dynamicWrapper(app, ['room'], () => import('../routes/SetRoom'))
    },
    '/energy/water/office': {
      component: dynamicWrapper(app, ['energy'], () => import('../routes/OfficeWater'))
    },
    '/energy/water/office/officeA': {
      component: dynamicWrapper(app, ['energy'], () => import('../routes/OfficeWater/OfficeA'))
    },
    '/energy/water/office/office-public': {
      component: dynamicWrapper(app, ['energy'], () => import('../routes/OfficeWater/OfficePublic.js'))
    },
    '/energy/water/office/business': {
      component: dynamicWrapper(app, ['energy'], () => import('../routes/OfficeWater/Business'))
    },
    '/energy/water/warehouse': {
      component: dynamicWrapper(app, ['energy'], () => import('../routes/WarehouseWater'))
    },
    '/energy/water/warehouse/ware': {
      component: dynamicWrapper(app, ['energy'], () => import('../routes/WarehouseWater/Ware'))
    },
    '/energy/water/warehouse/warehouse-public': {
      component: dynamicWrapper(app, ['energy'], () => import('../routes/WarehouseWater/WarePublic'))
    },
    '/energy/water/warehouse/business': {
      component: dynamicWrapper(app, ['energy'], () => import('../routes/WarehouseWater/Business'))
    },
    '/energy/water/phaseII': {
      component: dynamicWrapper(app, ['energy'], () => import('../routes/PhaseIIWater'))
    },
    '/energy/water/phaseII/phase2': {
      component: dynamicWrapper(app, ['energy'], () => import('../routes/PhaseIIWater/Phase2'))
    },
    '/energy/electricity/office': {
      component: dynamicWrapper(app, ['energy'], () => import('../routes/OfficeEle'))
    },
    '/energy/electricity/office/office-custom': {
      component: dynamicWrapper(app, ['energy'], () => import('../routes/OfficeEle/OfficeCustom'))
    },
    '/energy/electricity/office/officeA-public': {
      component: dynamicWrapper(app, ['energy'], () => import('../routes/OfficeEle/OfficePublic'))
    },
    '/energy/electricity/office/office-other': {
      component: dynamicWrapper(app, ['energy'], () => import('../routes/OfficeEle/OfficeOther'))
    },
    '/energy/electricity/warehouse': {
      component: dynamicWrapper(app, ['energy'], () => import('../routes/WareHouseEle'))
    },
    '/energy/electricity/warehouse/warehouse-custom': {
      component: dynamicWrapper(app, ['energy'], () => import('../routes/WareHouseEle/Custom'))
    },
    '/energy/electricity/warehouse/warehouse-other': {
      component: dynamicWrapper(app, ['energy'], () => import('../routes/WareHouseEle/Other'))
    },
    '/energy/electricity/phase': {
      component: dynamicWrapper(app, ['energy'], () => import('../routes/PhaseEle'))
    },
    '/energy/electricity/phase/phase-custom': {
      component: dynamicWrapper(app, ['energy'], () => import('../routes/PhaseEle/Custom'))
    },
    /* '/energy/water/warehouse': {
      component: dynamicWrapper(app, ['energy'], () => import('../routes/WarehouseWater'))
    },
    '/energy/water/warehouse/ware': {
      component: dynamicWrapper(app, ['energy'], () => import('../routes/WarehouseWater/Ware'))
    },
    '/energy/water/warehouse/warehouse-public': {
      component: dynamicWrapper(app, ['energy'], () => import('../routes/WarehouseWater/WarePublic'))
    },
    '/energy/water/warehouse/business': {
      component: dynamicWrapper(app, ['energy'], () => import('../routes/WarehouseWater/Business'))
    },
    '/energy/water/phaseII': {
      component: dynamicWrapper(app, ['energy'], () => import('../routes/PhaseIIWater'))
    },
    '/energy/water/phaseII/phase2': {
      component: dynamicWrapper(app, ['energy'], () => import('../routes/PhaseIIWater/Phase2'))
    }, */
    '/energy/set-water': {
      component: dynamicWrapper(app, ['energy'], () => import('../routes/SetWater'))
    },
    '/energy/set-water/office': {
      component: dynamicWrapper(app, ['contract','energy'], () => import('../routes/SetWater/Office'))
    },
    '/energy/set-water/warehouse': {
      component: dynamicWrapper(app, ['contract','energy'], () => import('../routes/SetWater/Warehouse'))
    },
    '/energy/set-water/phase2': {
      component: dynamicWrapper(app, ['contract','energy'], () => import('../routes/SetWater/Phase2'))
    },
    '/energy/set-ele': {
      component: dynamicWrapper(app, ['energy'], () => import('../routes/SetEle'))
    },
    '/energy/set-ele/office': {
      component: dynamicWrapper(app, ['contract','energy'], () => import('../routes/SetEle/Office'))
    },
    '/energy/set-ele/warehouse': {
      component: dynamicWrapper(app, ['contract','energy'], () => import('../routes/SetEle/Warehouse'))
    },
    '/energy/set-ele/phase2': {
      component: dynamicWrapper(app, ['contract','energy'], () => import('../routes/SetEle/Phase2'))
    },
    '/energy/statistical': {
      component: dynamicWrapper(app, ['statistical'], () => import('../routes/Statistical'))
    },
    '/energy/statistical/office': {
      component: dynamicWrapper(app, ['statistical'], () => import('../routes/Statistical/Office'))
    },
    '/energy/statistical/warehouse': {
      component: dynamicWrapper(app, ['statistical'], () => import('../routes/Statistical/Warehouse'))
    },
    '/cost/adv-pay': {
      component: dynamicWrapper(app, ['adv'], () => import('../routes/AdvPay'))
    },
    '/cost/adv-pay/custom': {
      component: dynamicWrapper(app, ['contract', 'adv'], () => import('../routes/AdvPay/Custom'))
    },
    '/cost/adv-pay/detail': {
      component: dynamicWrapper(app, ['adv'], () => import('../routes/AdvPay/Detail'))
    },
    '/cost/adv-pay/sur': {
      component: dynamicWrapper(app, ['adv'], () => import('../routes/AdvPay/SurDetail'))
    },
    '/cost/clearing': {
      component: dynamicWrapper(app, ['clearing'], () => import('../routes/Clearing'))
    },
    '/permission/custom': {
      component: dynamicWrapper(app, ['customs'], () => import('../routes/Custom'))
    },
    '/permission/role': {
      component: dynamicWrapper(app, ['role'], () => import('../routes/Role'))
    },
    '/permission/resource': {
      component: dynamicWrapper(app, ['resource'], () => import('../routes/Resource'))
    },
    '/exception/403': {
      component: dynamicWrapper(app, [], () => import('../routes/Exception/403')),
    },
    '/exception/404': {
      component: dynamicWrapper(app, [], () => import('../routes/Exception/404')),
    },
    '/exception/500': {
      component: dynamicWrapper(app, [], () => import('../routes/Exception/500')),
    },
  
    /* '/exception/trigger': {
      component: dynamicWrapper(app, ['error'], () =>
        import('../routes/Exception/triggerException')
      ),
    }, */
    '/user': {
      component: dynamicWrapper(app, [], () => import('../layouts/UserLayout')),
    },
    '/user/login': {
      component: dynamicWrapper(app, ['login'], () => import('../routes/User/Login')),
    },
    /* '/user/register': {
      component: dynamicWrapper(app, ['register'], () => import('../routes/User/Register')),
    },
    '/user/register-result': {
      component: dynamicWrapper(app, [], () => import('../routes/User/RegisterResult')),
    }, */
    // '/user/:id': {
    //   component: dynamicWrapper(app, [], () => import('../routes/User/SomeComponent')),
    // },
  };
  // Get name from ./menu.js or just set it in the router data.
  const menuData = getFlatMenuData(getMenuData());

  // Route configuration data
  // eg. {name,authority ...routerConfig }
  const routerData = {};
  // The route matches the menu
  Object.keys(routerConfig).forEach(path => {
    // Regular match item name
    // eg.  router /user/:id === /user/chen
    const pathRegexp = pathToRegexp(path);
    const menuKey = Object.keys(menuData).find(key => pathRegexp.test(`${key}`));
    let menuItem = {};
    // If menuKey is not empty
    if (menuKey) {
      menuItem = menuData[menuKey];
    }
    let router = routerConfig[path];
    // If you need to configure complex parameter routing,
    // https://github.com/ant-design/ant-design-pro-site/blob/master/docs/router-and-nav.md#%E5%B8%A6%E5%8F%82%E6%95%B0%E7%9A%84%E8%B7%AF%E7%94%B1%E8%8F%9C%E5%8D%95
    // eg . /list/:type/user/info/:id
    router = {
      ...router,
      name: router.name || menuItem.name,
      authority: router.authority || menuItem.authority,
      hideInBreadcrumb: router.hideInBreadcrumb || menuItem.hideInBreadcrumb,
    };
    routerData[path] = router;
  });
  return routerData;
};
