<script lang="ts" setup>
import type { VbenFormProps } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { Page, useVbenModal } from '@vben/common-ui';

import { Modal, Space } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  noticeCreateApi,
  noticeDeleteApi,
  noticeListApi,
  noticeUpdateApi,
} from '#/api';

import NoticeForm from './notice-form.vue';

const formOptions: VbenFormProps = {
  collapsed: false,
  schema: [
    { component: 'Input', fieldName: 'title', label: '公告标题' },
    {
      component: 'Select',
      componentProps: {
        options: [
          { label: '通知', value: 1 },
          { label: '公告', value: 2 },
        ],
      },
      fieldName: 'type',
      label: '公告类型',
    },
  ],
  showCollapseButton: false,
};

const gridOptions: VxeGridProps<any> = {
  columns: [
    { title: 'ID', type: 'seq', width: 60 },
    { field: 'title', title: '公告标题', minWidth: 200 },
    {
      field: 'type',
      title: '公告类型',
      width: 100,
      formatter: ({ row }) => (row.type === 1 ? '通知' : '公告'),
    },
    {
      cellRender: {
        attrs: { beforeChange: () => false },
        name: 'Switch',
        props: { checkedValue: 1, unCheckedValue: 0, disabled: true },
      },
      field: 'status',
      title: '状态',
      width: 80,
    },
    { field: 'createTime', title: '创建时间', formatter: 'formatDateTime', minWidth: 160 },
    { field: 'publishTime', title: '发布时间', formatter: 'formatDateTime', minWidth: 160 },
    {
      title: '操作',
      width: 160,
      fixed: 'right',
      slots: { default: 'actions' },
    },
  ],
  keepSource: true,
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues) =>
        (await noticeListApi({ page: page.currentPage, limit: page.pageSize, ...formValues })) as any,
    },
  },
  toolbarConfig: { custom: true, export: true, refresh: true, zoom: true },
};

const [Grid, gridApi] = useVbenVxeGrid({ formOptions, gridOptions });
const [NoticeModal, noticeModalApi] = useVbenModal({ connectedComponent: NoticeForm });

function handleAdd() {
  noticeModalApi.setData({}).open();
}
function handleEdit(row: any) {
  noticeModalApi.setData(row).open();
}
function handleDelete(row: any) {
  Modal.confirm({
    title: '提示',
    content: `确认删除公告【${row.title}】吗？`,
    okType: 'danger',
    onOk: async () => {
      await noticeDeleteApi(row.id);
      gridApi.reload();
    },
  });
}
async function onSubmit(values: any) {
  if (values.id) {
    await noticeUpdateApi(values);
  } else {
    await noticeCreateApi(values);
  }
  gridApi.reload();
}
</script>

<template>
  <Page auto-content-height>
    <Grid table-title="通知公告列表">
      <template #toolbar-tools>
        <Space><a-button type="primary" @click="handleAdd">新增公告</a-button></Space>
      </template>
      <template #actions="{ row }">
        <Space>
          <a-button size="small" type="link" @click="handleEdit(row)">编辑</a-button>
          <a-button size="small" type="link" danger @click="handleDelete(row)">删除</a-button>
        </Space>
      </template>
    </Grid>
    <NoticeModal @submit="onSubmit" />
  </Page>
</template>