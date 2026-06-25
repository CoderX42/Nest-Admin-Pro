<script lang="ts" setup>
import type { VxeGridProps } from '#/adapter/vxe-table';

import { Page } from '@vben/common-ui';

import { Modal } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { forceLogoutApi, onlineUserListApi } from '#/api';

const gridOptions: VxeGridProps<any> = {
  columns: [
    { title: '序号', type: 'seq', width: 60 },
    { field: 'username', title: '用户名', minWidth: 140 },
    { field: 'token', title: 'Token', minWidth: 240 },
    { field: 'loginTime', title: '登录时间', minWidth: 180 },
    {
      title: '操作',
      width: 140,
      fixed: 'right',
      slots: { default: 'actions' },
    },
  ],
  data: [],
  toolbarConfig: { custom: true, refresh: true, zoom: true },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

async function loadList() {
  const data: any = (await onlineUserListApi()) ?? [];
  if (gridApi.grid?.loadData) {
    gridApi.grid.loadData(data);
  } else {
    gridApi.setGridOptions({ data });
  }
}

function handleForceLogout(row: any) {
  Modal.confirm({
    title: '提示',
    content: `确认强制下线【${row.username}】吗？`,
    okType: 'danger',
    onOk: async () => {
      await forceLogoutApi(row.token);
      await loadList();
    },
  });
}

await loadList();
</script>

<template>
  <Page auto-content-height>
    <Grid table-title="在线用户">
      <template #actions="{ row }">
        <a-button size="small" type="link" danger @click="handleForceLogout(row)">强制下线</a-button>
      </template>
    </Grid>
  </Page>
</template>