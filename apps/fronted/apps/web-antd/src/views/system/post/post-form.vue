<script lang="ts" setup>
import type { VbenFormProps } from '#/adapter/form';

import { computed, watch } from 'vue';

import { useVbenForm } from '#/adapter/form';

const props = defineProps<{ data?: any }>();
const emit = defineEmits<{ submit: [any] }>();

const formSchema = computed((): VbenFormProps['schema'] => [
  { component: 'Input', fieldName: 'name', label: '岗位名称', rules: 'required' },
  { component: 'Input', fieldName: 'code', label: '岗位编码', rules: 'required' },
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
    if (val?.id) {
      formApi.setValues(val);
    } else {
      formApi.resetForm();
      formApi.setValues({ status: 1, sort: 0 });
    }
  },
  { immediate: true },
);
</script>

<template>
  <Form />
</template>