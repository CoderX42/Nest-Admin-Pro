<script lang="ts" setup>
import type { VbenFormProps } from '#/adapter/form';

import { computed, ref, watch } from 'vue';

import { useVbenForm } from '#/adapter/form';

import { menuTreeApi } from '#/api';

const props = defineProps<{ data?: any }>();
const emit = defineEmits<{ submit: [any] }>();

const treeData = ref<any[]>([]);

function flattenTreeWithCheckbox(list: any[]): any[] {
  return list
    .filter((n) => n.type !== 3)
    .map((n) => ({
      value: n.id,
      label: n.name,
      children: n.children?.length ? flattenTreeWithCheckbox(n.children) : undefined,
    }));
}

async function loadTree() {
  const data: any = await menuTreeApi();
  treeData.value = flattenTreeWithCheckbox(data ?? []);
}

const formSchema = computed((): VbenFormProps['schema'] => [
  { component: 'Input', fieldName: 'name', label: '角色名', rules: 'required' },
  { component: 'Input', fieldName: 'code', label: '权限字符', rules: 'required' },
  {
    component: 'InputNumber',
    fieldName: 'sort',
    label: '显示顺序',
    defaultValue: 0,
  },
  {
    component: 'RadioGroup',
    componentProps: {
      options: [
        { label: '正常', value: 1 },
        { label: '禁用', value: 0 },
      ],
    },
    defaultValue: 1,
    fieldName: 'status',
    label: '状态',
  },
  {
    component: 'TreeSelect',
    componentProps: {
      checkable: true,
      multiple: true,
      options: treeData,
      treeCheckable: true,
    },
    fieldName: 'menuIds',
    label: '菜单权限',
  },
  { component: 'Textarea', fieldName: 'remark', label: '备注' },
]);

const [Form, formApi] = useVbenForm({
  handleSubmit: (values) => emit('submit', values),
  schema: formSchema,
  showDefaultActions: false,
});

watch(
  () => props.data,
  async (val) => {
    await loadTree();
    if (val?.id) {
      let menuIds: number[] = [];
      try {
        menuIds = JSON.parse(val.menuIds ?? '[]');
      } catch {
        menuIds = [];
      }
      formApi.setValues({ ...val, menuIds });
    } else {
      formApi.resetForm();
    }
  },
  { immediate: true },
);
</script>

<template>
  <Form />
</template>