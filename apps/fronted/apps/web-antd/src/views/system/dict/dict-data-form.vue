<script lang="ts" setup>
import type { VbenFormProps } from '#/adapter/form';

import { computed, watch } from 'vue';

import { useVbenForm } from '#/adapter/form';

const props = defineProps<{ data?: any }>();
const emit = defineEmits<{ submit: [any] }>();

const formSchema = computed((): VbenFormProps['schema'] => [
  { component: 'Input', fieldName: 'label', label: '字典标签', rules: 'required' },
  { component: 'Input', fieldName: 'value', label: '字典键值', rules: 'required' },
  { component: 'InputNumber', defaultValue: 0, fieldName: 'sort', label: '字典排序' },
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
      formApi.setValues({ dictTypeId: val?.dictTypeId, status: 1, sort: 0 });
    }
  },
  { immediate: true },
);
</script>

<template>
  <Form />
</template>