<script setup lang="ts">
import type { VbenFormSchema } from '#/adapter/form';

import { computed, onMounted, ref } from 'vue';

import { ProfileBaseSetting } from '@vben/common-ui';

import { getProfileApi, updateProfileApi } from '#/api';
import { message } from 'ant-design-vue';

const profileBaseSettingRef = ref();

const formSchema = computed((): VbenFormSchema[] => {
  return [
    { component: 'Input', fieldName: 'username', label: '用户名', componentProps: { disabled: true } },
    { component: 'Input', fieldName: 'nickname', label: '昵称', rules: 'required' },
    { component: 'Input', fieldName: 'email', label: '邮箱', rules: 'email' },
    { component: 'Input', fieldName: 'phone', label: '手机号' },
    { component: 'Input', fieldName: 'remark', label: '备注' },
  ];
});

onMounted(async () => {
  const data = await getProfileApi();
  profileBaseSettingRef.value.getFormApi().setValues(data);
});

async function handleSubmit() {
  const values = await profileBaseSettingRef.value.getFormApi().getValues();
  await updateProfileApi({
    nickname: values.nickname,
    email: values.email,
    phone: values.phone,
    remark: values.remark,
  });
  message.success('保存成功');
}
</script>

<template>
  <ProfileBaseSetting
    ref="profileBaseSettingRef"
    :form-schema="formSchema"
  />
  <div class="mt-4 flex justify-end">
    <a-button type="primary" @click="handleSubmit">保存</a-button>
  </div>
</template>