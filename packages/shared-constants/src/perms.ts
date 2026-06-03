export const PERMS = {
  system: {
    user: {
      list: 'system:user:list',
      query: 'system:user:query',
      add: 'system:user:add',
      edit: 'system:user:edit',
      remove: 'system:user:remove',
      import: 'system:user:import',
      export: 'system:user:export',
      resetPwd: 'system:user:resetPwd',
    },
    role: {
      list: 'system:role:list',
      query: 'system:role:query',
      add: 'system:role:add',
      edit: 'system:role:edit',
      remove: 'system:role:remove',
      assign: 'system:role:assign',
    },
    menu: {
      list: 'system:menu:list',
      query: 'system:menu:query',
      add: 'system:menu:add',
      edit: 'system:menu:edit',
      remove: 'system:menu:remove',
    },
    dict: {
      list: 'system:dict:list',
      query: 'system:dict:query',
      add: 'system:dict:add',
      edit: 'system:dict:edit',
      remove: 'system:dict:remove',
    },
    config: {
      list: 'system:config:list',
      query: 'system:config:query',
      add: 'system:config:add',
      edit: 'system:config:edit',
      remove: 'system:config:remove',
    },
    notice: {
      list: 'system:notice:list',
      query: 'system:notice:query',
      add: 'system:notice:add',
      edit: 'system:notice:edit',
      remove: 'system:notice:remove',
    },
    dept: {
      list: 'system:dept:list',
      query: 'system:dept:query',
      add: 'system:dept:add',
      edit: 'system:dept:edit',
      remove: 'system:dept:remove',
    },
    post: {
      list: 'system:post:list',
      query: 'system:post:query',
      add: 'system:post:add',
      edit: 'system:post:edit',
      remove: 'system:post:remove',
    },
    file: {
      list: 'system:file:list',
      query: 'system:file:query',
      remove: 'system:file:remove',
    },
  },
  monitor: {
    online: {
      list: 'monitor:online:list',
    },
    server: {
      list: 'monitor:server:list',
    },
    oper: {
      list: 'monitor:oper:list',
      export: 'monitor:oper:export',
      remove: 'monitor:oper:remove',
    },
    login: {
      list: 'monitor:login:list',
      export: 'monitor:login:export',
      remove: 'monitor:login:remove',
    },
    cache: {
      list: 'monitor:cache:list',
    },
  },
} as const;

export type PermModule = keyof typeof PERMS;
