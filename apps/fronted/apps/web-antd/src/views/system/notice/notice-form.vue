<script lang="ts" setup>
import type { VbenFormProps } from '#/adapter/form';

import { computed, watch } from 'vue';

import { useVbenForm } from '#/adapter/form';

const props = defineProps<{ data?: any }>();
const emit = defineEmits<{ submit: [any] }>();

const formSchema = computed((): VbenFormProps['schema'] => [
  { component: 'Input', fieldName: 'title', label: '公告标题', rules: 'required' },
  {
    component: 'RadioGroup',
    componentProps: { options: [{ label: '通知', value: 1 }, { label: '公告', value: 2 }] },
    defaultValue: 1,
    fieldName: 'type',
    label: '公告类型',
  },
  {
    component: 'RadioGroup',
    componentProps: { options: [{ label: '正常', value: 1 }, { label: '停用', value: 0 }] },
    defaultValue: 1,
    fieldName: 'status',
    label: '状态',
  },
  { component: 'Textarea', fieldName: 'content', label: '内容', rules: 'required' },
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
      formApi.setValues({ status: 1, type: 1 });
    }
  },
  { immediate: true },
);
</script>

<template>
  <Form />
</template>