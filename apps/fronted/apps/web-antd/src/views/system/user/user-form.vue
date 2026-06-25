<script lang="ts" setup>
import type { VbenFormProps } from '#/adapter/form';

import { computed, ref, watch } from 'vue';

import { useVbenForm } from '#/adapter/form';

import { deptTreeApi, roleListApi } from '#/api';

const props = defineProps<{ data?: any }>();
const emit = defineEmits<{ submit: [any] }>();

const deptOptions = ref<any[]>([]);
const roleOptions = ref<any[]>([]);

async function loadOptions() {
  const [depts, roles]: any[] = await Promise.all([
    deptTreeApi(),
    roleListApi({ limit: 100 }),
  ]);
  // 后端返回的部门结构是嵌套树，转为扁平以便 TreeSelect 显示
  function flatten(list: any[]): any[] {
    const result: any[] = [];
    for (const item of list) {
      result.push({ value: item.id, label: item.name });
      if (item.children?.length) result.push(...flatten(item.children));
    }
    return result;
  }
  deptOptions.value = flatten(depts ?? []);
  roleOptions.value = (roles?.items ?? []).map((r: any) => ({
    value: r.id,
    label: r.name,
  }));
}

const formSchema = computed((): VbenFormProps['schema'] => [
  { component: 'Input', fieldName: 'username', label: '用户名', rules: 'required' },
  {
    component: 'InputPassword',
    fieldName: 'password',
    label: '密码',
    dependencies: {
      triggerFields: ['id'],
      show: (values) => !values.id,
    },
    rules: 'required',
  },
  { component: 'Input', fieldName: 'nickname', label: '昵称' },
  { component: 'Input', fieldName: 'email', label: '邮箱', rules: 'email' },
  { component: 'Input', fieldName: 'phone', label: '手机号' },
  {
    component: 'TreeSelect',
    componentProps: { options: deptOptions },
    fieldName: 'deptId',
    label: '部门',
  },
  {
    component: 'Select',
    componentProps: { mode: 'multiple', options: roleOptions },
    fieldName: 'roleIds',
    label: '角色',
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
    await loadOptions();
    if (val?.id) {
      formApi.setValues({
        ...val,
        roleIds: val.roles?.map((r: any) => r.id),
      });
    } else {
      formApi.resetForm();
    }
  },
  { immediate: true },
);

defineExpose({ formApi });
</script>

<template>
  <Form />
</template>