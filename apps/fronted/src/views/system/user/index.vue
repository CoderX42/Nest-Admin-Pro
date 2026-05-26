<template>
  <div class="space-y-4">
    <!-- Search & toolbar card -->
    <div class="card bg-base-100 shadow-sm border border-base-300">
      <div class="card-body p-4">
        <div class="flex flex-wrap gap-3 items-end">
          <div class="form-control flex-1 min-w-44">
            <label class="label py-0"><span class="label-text text-xs text-base-content/50">{{ t('system.user.username') }}</span></label>
            <input v-model="queryParams.username" :placeholder="t('system.user.placeholderUsername')" class="input input-bordered input-sm w-full" @keyup.enter="loadData" />
          </div>
          <div class="form-control flex-1 min-w-44">
            <label class="label py-0"><span class="label-text text-xs text-base-content/50">{{ t('system.user.nickname') }}</span></label>
            <input v-model="queryParams.nickname" :placeholder="t('system.user.placeholderNickname')" class="input input-bordered input-sm w-full" @keyup.enter="loadData" />
          </div>
          <div class="form-control min-w-32">
            <label class="label py-0"><span class="label-text text-xs text-base-content/50">{{ t('common.field.status') }}</span></label>
            <select v-model="queryParams.status" class="select select-bordered select-sm w-full">
              <option :value="undefined">—</option>
              <option :value="1">{{ t('common.status.enabled') }}</option>
              <option :value="0">{{ t('common.status.disabled') }}</option>
            </select>
          </div>
          <div class="flex gap-2">
            <button class="btn btn-sm btn-primary gap-1.5" @click="loadData">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              {{ t('common.action.search') }}
            </button>
            <button class="btn btn-sm btn-ghost gap-1.5" @click="resetQuery">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              {{ t('common.action.reset') }}
            </button>
          </div>
          <div class="flex-1"></div>
          <button class="btn btn-sm btn-primary gap-1.5" @click="handleCreate">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
            {{ t('system.user.addUser') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Table card -->
    <div class="card bg-base-100 shadow-sm border border-base-300 rounded-xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="table table-zebra table-sm">
          <thead>
            <tr class="text-xs uppercase tracking-wider font-semibold bg-base-200">
              <th class="w-14">{{ t('common.field.id') }}</th>
              <th>{{ t('system.user.username') }}</th>
              <th>{{ t('system.user.nickname') }}</th>
              <th>{{ t('system.user.email') }}</th>
              <th>{{ t('system.user.phone') }}</th>
              <th class="w-28">{{ t('system.user.department') }}</th>
              <th class="w-44">{{ t('system.user.roles') }}</th>
              <th class="w-20">{{ t('common.field.status') }}</th>
              <th class="w-36">{{ t('common.field.createTime') }}</th>
              <th class="w-64">{{ t('common.field.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-base-200">
            <tr v-if="loading">
              <td colspan="10" class="text-center py-12">
                <span class="loading loading-spinner loading-sm text-primary"></span>
              </td>
            </tr>
            <tr v-else-if="!tableData.length">
              <td colspan="10" class="text-center text-base-content/40 py-12">No data</td>
            </tr>
            <tr v-else v-for="row in tableData" :key="row.id" class="hover:bg-base-200/40 transition-colors">
              <td class="text-xs text-base-content/50 font-mono">{{ row.id }}</td>
              <td class="text-sm font-semibold">{{ row.username }}</td>
              <td class="text-sm">{{ row.nickname }}</td>
              <td class="text-xs text-base-content/60">{{ row.email || '-' }}</td>
              <td class="text-xs text-base-content/60">{{ row.phone || '-' }}</td>
              <td class="text-xs">
                <span v-if="row.dept?.name" class="badge badge-ghost badge-sm">{{ row.dept.name }}</span>
                <span v-else class="text-base-content/30">-</span>
              </td>
              <td>
                <div class="flex flex-wrap gap-1">
                  <span v-for="role in (row.roles || []).slice(0, 2)" :key="role.id" class="badge badge-primary badge-sm font-medium">{{ role.name }}</span>
                  <span v-if="(row.roles || []).length > 2" class="badge badge-ghost badge-sm">+{{ row.roles.length - 2 }}</span>
                  <span v-if="!(row.roles?.length)" class="text-base-content/30 text-xs">-</span>
                </div>
              </td>
              <td>
                <input type="checkbox" class="toggle toggle-success toggle-sm" :checked="row.status === 1" @change="(e) => handleStatusChange(row, (e.target as HTMLInputElement).checked ? 1 : 0)" />
              </td>
              <td class="text-xs text-base-content/50">{{ row.createTime }}</td>
              <td>
                <div class="flex gap-1.5">
                  <button class="btn btn-xs btn-primary gap-1" @click="handleEdit(row)">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    {{ t('common.action.edit') }}
                  </button>
                  <button class="btn btn-xs btn-warning gap-1" @click="handleResetPwd(row)">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                    {{ t('common.action.resetPwd') }}
                  </button>
                  <button class="btn btn-xs btn-error gap-1" @click="handleDelete(row)">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    {{ t('common.action.delete') }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="flex items-center justify-between px-4 py-3 border-t border-base-200 bg-base-100">
        <span class="text-xs text-base-content/50">共 {{ total }} 条</span>
        <div class="join">
          <button class="join-item btn btn-sm" :disabled="queryParams.page <= 1" @click="queryParams.page--; loadData()">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button class="join-item btn btn-sm btn-active" disabled>{{ queryParams.page }}</button>
          <button class="join-item btn btn-sm" :disabled="queryParams.page * queryParams.limit >= total" @click="queryParams.page++; loadData()">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
          </button>
          <select class="join-item btn btn-sm" v-model="queryParams.limit" @change="loadData">
            <option :value="10">10/页</option>
            <option :value="20">20/页</option>
            <option :value="50">50/页</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Dialog -->
    <dialog ref="dialogRef" class="modal">
      <div class="modal-box max-w-lg">
        <div class="flex items-center gap-3 mb-5">
          <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          </div>
          <div>
            <h3 class="font-bold text-base">{{ form.id ? t('system.user.editUser') : t('system.user.addUser') }}</h3>
            <p class="text-xs text-base-content/50">{{ form.id ? '编辑用户信息' : '新增一个系统用户' }}</p>
          </div>
        </div>
        <form @submit.prevent="handleSubmit" class="space-y-3">
          <label v-if="!form.id" class="form-control">
            <div class="label"><span class="label-text text-sm font-medium">{{ t('system.user.username') }} *</span></div>
            <input v-model="form.username" class="input input-bordered input-sm" required />
          </label>
          <label v-if="!form.id" class="form-control">
            <div class="label"><span class="label-text text-sm font-medium">{{ t('system.user.password') }} *</span></div>
            <input v-model="form.password" type="password" class="input input-bordered input-sm" autocomplete="new-password" required />
          </label>
          <div class="grid grid-cols-2 gap-3">
            <label class="form-control">
              <div class="label"><span class="label-text text-sm font-medium">{{ t('system.user.nickname') }}</span></div>
              <input v-model="form.nickname" class="input input-bordered input-sm" />
            </label>
            <label class="form-control">
              <div class="label"><span class="label-text text-sm font-medium">{{ t('system.user.email') }}</span></div>
              <input v-model="form.email" type="email" class="input input-bordered input-sm" />
            </label>
          </div>
          <label class="form-control">
            <div class="label"><span class="label-text text-sm font-medium">{{ t('system.user.phone') }}</span></div>
            <input v-model="form.phone" class="input input-bordered input-sm" />
          </label>
          <label class="form-control">
            <div class="label"><span class="label-text text-sm font-medium">{{ t('system.user.department') }}</span></div>
            <el-tree-select v-model="form.deptId" :data="deptTree" :props="{ label: 'name', value: 'id', children: 'children' }" check-strictly clearable :placeholder="t('system.user.selectDepartment')" class="w-full" />
          </label>
          <div class="grid grid-cols-2 gap-3">
            <label class="form-control">
              <div class="label"><span class="label-text text-sm font-medium">{{ t('system.user.posts') }}</span></div>
              <select v-model="form.postIds" multiple class="select select-bordered select-sm w-full h-20">
                <option v-for="post in postOptions" :key="post.id" :value="post.id">{{ post.name }}</option>
              </select>
            </label>
            <label class="form-control">
              <div class="label"><span class="label-text text-sm font-medium">{{ t('system.user.roles') }}</span></div>
              <select v-model="form.roleIds" multiple class="select select-bordered select-sm w-full h-20">
                <option v-for="role in roleOptions" :key="role.id" :value="role.id">{{ role.name }}</option>
              </select>
            </label>
          </div>
          <label class="form-control">
            <div class="label"><span class="label-text text-sm font-medium">{{ t('common.field.status') }}</span></div>
            <div class="flex gap-4 pt-1">
              <label class="label cursor-pointer gap-2">
                <input type="radio" v-model="form.status" :value="1" class="radio radio-sm radio-primary" />
                <span class="label-text text-sm">{{ t('common.status.enabled') }}</span>
              </label>
              <label class="label cursor-pointer gap-2">
                <input type="radio" v-model="form.status" :value="0" class="radio radio-sm radio-primary" />
                <span class="label-text text-sm">{{ t('common.status.disabled') }}</span>
              </label>
            </div>
          </label>
          <div class="flex justify-end gap-2 pt-2">
            <button type="button" class="btn btn-sm" @click="dialogRef?.close()">{{ t('common.action.cancel') }}</button>
            <button type="submit" class="btn btn-sm btn-primary">{{ t('common.action.confirm') }}</button>
          </div>
        </form>
      </div>
      <form method="dialog" class="modal-backdrop"><button>close</button></form>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { userApi, deptApi, postApi, roleApi } from '@/api';
import { ElMessage, ElMessageBox } from 'element-plus';

const { t } = useI18n();

const loading = ref(false);
const tableData = ref<any[]>([]);
const total = ref(0);
const queryParams = reactive({ username: '', nickname: '', status: undefined as number | undefined, page: 1, limit: 10 });

const dialogRef = ref<HTMLDialogElement>();
const deptTree = ref<any[]>([]);
const postOptions = ref<any[]>([]);
const roleOptions = ref<any[]>([]);

const form = reactive<any>({ username: '', password: '', nickname: '', email: '', phone: '', deptId: undefined, postIds: [], roleIds: [], status: 1 });

const loadData = async () => {
  loading.value = true;
  try {
    const res: any = await userApi.list(queryParams);
    tableData.value = res.items || [];
    total.value = res.total || 0;
  } catch { ElMessage.error(t('common.message.loadFailed')); }
  finally { loading.value = false; }
};

const loadDeptTree = async () => { const res: any = await deptApi.tree(); deptTree.value = res; };
const loadOptions = async () => {
  const [postRes, roleRes]: any[] = await Promise.all([postApi.list({ page: 1, limit: 1000 }), roleApi.list({ page: 1, limit: 1000 })]);
  postOptions.value = postRes.items || [];
  roleOptions.value = roleRes.items || [];
};

const parsePostIds = (value: unknown) => {
  if (Array.isArray(value)) return value.map(Number);
  if (typeof value === 'string' && value) { try { return JSON.parse(value).map(Number); } catch { return []; } }
  return [];
};

const resetQuery = () => { queryParams.username = ''; queryParams.nickname = ''; queryParams.status = undefined; queryParams.page = 1; loadData(); };

const handleCreate = () => {
  Object.assign(form, { id: undefined, username: '', password: '', nickname: '', email: '', phone: '', deptId: undefined, postIds: [], roleIds: [], status: 1 });
  dialogRef.value?.showModal();
};

const handleEdit = (row: any) => {
  Object.assign(form, {
    id: row.id, username: row.username, password: '', nickname: row.nickname,
    email: row.email, phone: row.phone, deptId: row.deptId,
    postIds: parsePostIds(row.postIds),
    roleIds: (row.roles || []).map((role: any) => Number(role.id)),
    status: row.status,
  });
  dialogRef.value?.showModal();
};

const handleSubmit = async () => {
  try {
    const payload: any = { ...form };
    if (form.id) {
      delete payload.username;
      delete payload.password;
      delete payload.postIds;
      delete payload.roleIds;
      await userApi.update(payload);
      await userApi.assignRoles(form.id, form.roleIds || []);
      ElMessage.success(t('common.message.updateSuccess'));
    } else {
      delete payload.id;
      delete payload.postIds;
      delete payload.roleIds;
      const created: any = await userApi.create(payload);
      if (form.roleIds?.length && created?.id) await userApi.assignRoles(created.id, form.roleIds);
      ElMessage.success(t('common.message.addSuccess'));
    }
    dialogRef.value?.close();
    loadData();
  } catch (e: any) { ElMessage.error(e.message || t('common.message.failed')); }
};

const handleStatusChange = async (row: any, status: number) => {
  try { await userApi.changeStatus(row.id, status); ElMessage.success(t('common.message.statusUpdateSuccess')); }
  catch (e: any) { row.status = status === 1 ? 0 : 1; ElMessage.error(e.message || t('common.message.failed')); }
};

const handleResetPwd = async (row: any) => {
  await ElMessageBox.confirm(t('common.message.confirmResetPwd', { name: row.username }), t('common.action.confirm'), { type: 'warning' });
  await userApi.resetPassword(row.id); ElMessage.success(t('common.message.resetPwdSuccess'));
};

const handleDelete = async (row: any) => {
  await ElMessageBox.confirm(t('common.message.confirmDelete', { name: row.username }), t('common.action.confirm'), { type: 'warning' });
  await userApi.delete(row.id); ElMessage.success(t('common.message.deleteSuccess')); loadData();
};

onMounted(() => { loadData(); loadDeptTree(); loadOptions(); });
</script>