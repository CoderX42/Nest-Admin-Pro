<script lang="ts" setup>
import type { VbenFormProps } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { Page, useVbenModal } from '@vben/common-ui';

import { Modal, Space } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  postCreateApi,
  postDeleteApi,
  postListApi,
  postUpdateApi,
} from '#/api';

import PostForm from './post-form.vue';

interface RowType {
  code: string;
  id: number;
  name: string;
  remark?: string;
  sort: number;
  status: number;
}

const formOptions: VbenFormProps = {
  collapsed: false,
  schema: [
    { component: 'Input', fieldName: 'name', label: '岗位名称' },
    { component: 'Input', fieldName: 'code', label: '岗位编码' },
    {
      component: 'Select',
      componentProps: {
        options: [
          { label: '正常', value: 1 },
          { label: '停用', value: 0 },
        ],
      },
      fieldName: 'status',
      label: '状态',
    },
  ],
  showCollapseButton: false,
};

const gridOptions: VxeGridProps<RowType> = {
  columns: [
    { title: 'ID', type: 'seq', width: 50 },
    { field: 'name', title: '岗位名称', minWidth: 140 },
    { field: 'code', title: '岗位编码', minWidth: 140 },
    { field: 'sort', title: '排序', width: 80 },
    {
      field: 'status',
      title: '状态',
      width: 80,
      cellRender: { name: 'Switch', props: { checkedValue: 1, unCheckedValue: 0, disabled: true } },
    },
    { field: 'remark', title: '备注', minWidth: 160 },
    { field: 'createTime', title: '创建时间', formatter: 'formatDateTime', minWidth: 160 },
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
        (await postListApi({ page: page.currentPage, limit: page.pageSize, ...formValues })) as any,
    },
  },
  toolbarConfig: { custom: true, export: true, refresh: true, zoom: true },
};

const [Grid, gridApi] = useVbenVxeGrid({ formOptions, gridOptions });
const [PostModal, postModalApi] = useVbenModal({ connectedComponent: PostForm });

function handleAdd() {
  postModalApi.setData({}).open();
}
function handleEdit(row: RowType) {
  postModalApi.setData(row).open();
}
function handleDelete(row: RowType) {
  Modal.confirm({
    title: '提示',
    content: `确认删除岗位【${row.name}】吗？`,
    okType: 'danger',
    onOk: async () => {
      await postDeleteApi(row.id);
      gridApi.reload();
    },
  });
}
async function onSubmit(values: any) {
  if (values.id) {
    await postUpdateApi(values);
  } else {
    await postCreateApi(values);
  }
  gridApi.reload();
}
</script>

<template>
  <Page auto-content-height>
    <Grid table-title="岗位列表">
      <template #toolbar-tools>
        <Space><a-button type="primary" @click="handleAdd">新增岗位</a-button></Space>
      </template>
      <template #actions="{ row }">
        <Space>
          <a-button size="small" type="link" @click="handleEdit(row)">编辑</a-button>
          <a-button size="small" type="link" danger @click="handleDelete(row)">删除</a-button>
        </Space>
      </template>
    </Grid>
    <PostModal @submit="onSubmit" />
  </Page>
</template>