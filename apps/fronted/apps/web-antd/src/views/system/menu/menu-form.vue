<script lang="ts" setup>
import type { VbenFormProps } from '#/adapter/form';

import { computed, ref, watch } from 'vue';

import { useVbenForm } from '#/adapter/form';

import { menuListApi } from '#/api';

const props = defineProps<{ data?: any }>();
const emit = defineEmits<{ submit: [any] }>();

const parentOptions = ref<any[]>([]);

async function loadParents() {
  const list: any = await menuListApi();
  function build(list: any[]): any[] {
    return list
      .filter((n) => n.type !== 3)
      .map((n) => ({
        value: n.id,
        label: n.name,
        children: n.children?.length ? build(n.children) : undefined,
      }));
  }
  parentOptions.value = build(list ?? []);
}

const formSchema = computed((): VbenFormProps['schema'] => [
  {
    component: 'RadioGroup',
    componentProps: {
      options: [
        { label: '目录', value: 1 },
        { label: '菜单', value: 2 },
        { label: '按钮', value: 3 },
      ],
    },
    defaultValue: 1,
    fieldName: 'type',
    label: '菜单类型',
  },
  {
    component: 'TreeSelect',
    componentProps: { options: parentOptions },
    defaultValue: 0,
    fieldName: 'parentId',
    label: '上级菜单',
  },
  { component: 'Input', fieldName: 'name', label: '菜单名称', rules: 'required' },
  {
    component: 'Input',
    dependencies: { show: (values) => values.type !== 3 },
    fieldName: 'path',
    label: '路由地址',
  },
  {
    component: 'Input',
    dependencies: { show: (values) => values.type === 2 },
    fieldName: 'component',
    label: '组件路径',
  },
  {
    component: 'IconPicker',
    dependencies: { show: (values) => values.type !== 3 },
    fieldName: 'icon',
    label: '图标',
  },
  {
    component: 'Input',
    dependencies: { show: (values) => values.type === 3 },
    fieldName: 'perms',
    label: '权限标识',
  },
  {
    component: 'InputNumber',
    defaultValue: 0,
    fieldName: 'sort',
    label: '显示顺序',
  },
  {
    component: 'RadioGroup',
    componentProps: {
      options: [
        { label: '显示', value: 1 },
        { label: '隐藏', value: 0 },
      ],
    },
    defaultValue: 1,
    dependencies: { show: (values) => values.type !== 3 },
    fieldName: 'show',
    label: '是否显示',
  },
]);

const [Form, formApi] = useVbenForm({
  handleSubmit: (values) => emit('submit', values),
  schema: formSchema,
  showDefaultActions: false,
});

watch(
  () => props.data,
  async (val) => {
    await loadParents();
    if (val?.id) {
      formApi.setValues(val);
    } else {
      formApi.resetForm();
      formApi.setValues({ parentId: val?.parentId ?? 0, type: 1, show: 1, sort: 0 });
    }
  },
  { immediate: true },
);
</script>

<template>
  <Form />
</template>