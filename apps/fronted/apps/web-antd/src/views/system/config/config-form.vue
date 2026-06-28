<script lang="ts" setup>
import type { VbenFormProps } from '#/adapter/form';

import { computed, watch } from 'vue';

import { useVbenForm } from '#/adapter/form';

const props = defineProps<{ data?: any }>();
const emit = defineEmits<{ submit: [any] }>();

const formSchema = computed((): VbenFormProps['schema'] => [
  { component: 'Input', fieldName: 'name', label: '参数名称', rules: 'required' },
  { component: 'Input', fieldName: 'key', label: '参数键名', rules: 'required' },
  { component: 'Input', fieldName: 'value', label: '参数键值', rules: 'required' },
  {
    component: 'RadioGroup',
    componentProps: { options: [{ label: '系统内置', value: 'system' }, { label: '业务参数', value: 'business' }] },
    defaultValue: 'business',
    fieldName: 'type',
    label: '系统内置',
  },
  {
    component: 'RadioGroup',
    componentProps: { options: [{ label: '正常', value: 1 }, { label: '停用', value: 0 }] },
    defaultValue: 1,
    fieldName: 'status',
    label: '状态',
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
  (val) => {
    if (val?.id) formApi.setValues(val);
    else {
      formApi.resetForm();
      formApi.setValues({ status: 1, type: 'business' });
    }
  },
  { immediate: true },
);
</script>

<template>
  <Form />
</template>