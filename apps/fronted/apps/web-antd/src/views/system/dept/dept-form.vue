<script lang="ts" setup>
import type { VbenFormProps } from '#/adapter/form';

import { computed, ref, watch } from 'vue';

import { useVbenForm } from '#/adapter/form';

import { deptListApi } from '#/api';

const props = defineProps<{ data?: any }>();
const emit = defineEmits<{ submit: [any] }>();

const parentOptions = ref<any[]>([]);

async function loadParents() {
  const list: any = await deptListApi();
  function build(list: any[]): any[] {
    return list.map((n: any) => ({
      value: n.id,
      label: n.name,
      children: n.children?.length ? build(n.children) : undefined,
    }));
  }
  parentOptions.value = build(list ?? []);
}

const formSchema = computed((): VbenFormProps['schema'] => [
  {
    component: 'TreeSelect',
    componentProps: { options: parentOptions },
    defaultValue: 0,
    fieldName: 'parentId',
    label: '上级部门',
  },
  { component: 'Input', fieldName: 'name', label: '部门名称', rules: 'required' },
  { component: 'InputNumber', defaultValue: 0, fieldName: 'sort', label: '显示顺序' },
  {
    component: 'RadioGroup',
    componentProps: {
      options: [
        { label: '正常', value: 1 },
        { label: '停用', value: 0 },
      ],
    },
    defaultValue: 1,
    fieldName: 'status',
    label: '状态',
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
      formApi.setValues({ parentId: val?.parentId ?? 0, status: 1, sort: 0 });
    }
  },
  { immediate: true },
);
</script>

<template>
  <Form />
</template>