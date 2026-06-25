<script lang="ts" setup>
import type { VbenFormProps } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { Page } from '@vben/common-ui';

import { Modal, Space } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { loginLogCleanApi, loginLogListApi } from '#/api';

const formOptions: VbenFormProps = {
  collapsed: false,
  schema: [
    { component: 'Input', fieldName: 'username', label: '用户名' },
    {
      component: 'Select',
      componentProps: {
        options: [
          { label: '成功', value: 1 },
          { label: '失败', value: 0 },
        ],
      },
      fieldName: 'status',
      label: '状态',
    },
  ],
  showCollapseButton: false,
};

const gridOptions: VxeGridProps<any> = {
  columns: [
    { title: 'ID', type: 'seq', width: 60 },
    { field: 'username', title: '用户名', minWidth: 140 },
    { field: 'ip', title: '登录IP', minWidth: 140 },
    { field: 'location', title: '登录地点', minWidth: 160 },
    { field: 'os', title: '操作系统', minWidth: 140 },
    { field: 'browser', title: '浏览器', minWidth: 140 },
    {
      field: 'status',
      title: '状态',
      width: 80,
      formatter: ({ row }) => (row.status === 1 ? '成功' : '失败'),
    },
    { field: 'msg', title: '消息', minWidth: 200 },
    { field: 'createTime', title: '登录时间', formatter: 'formatDateTime', minWidth: 160 },
  ],
  keepSource: true,
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues) =>
        (await loginLogListApi({ page: page.currentPage, limit: page.pageSize, ...formValues })) as any,
    },
  },
  toolbarConfig: { custom: true, export: true, refresh: true, zoom: true },
};

const [Grid, gridApi] = useVbenVxeGrid({ formOptions, gridOptions });

function handleClean() {
  Modal.confirm({
    title: '提示',
    content: '确认清空所有登录日志吗？该操作不可恢复。',
    okType: 'danger',
    onOk: async () => {
      await loginLogCleanApi();
      gridApi.reload();
    },
  });
}
</script>

<template>
  <Page auto-content-height>
    <Grid table-title="登录日志">
      <template #toolbar-tools>
        <Space><a-button danger @click="handleClean">清空</a-button></Space>
      </template>
    </Grid>
  </Page>
</template>