<template>
  <div class="page-container">
    <el-card class="filter-form">
      <el-form :inline="true" :model="queryParams">
        <el-form-item :label="t('system.user.username')">
          <el-input
            v-model="queryParams.username"
            :placeholder="t('system.user.placeholderUsername')"
            clearable
            @keyup.enter="loadData"
          />
        </el-form-item>
        <el-form-item :label="t('system.user.nickname')">
          <el-input
            v-model="queryParams.nickname"
            :placeholder="t('system.user.placeholderNickname')"
            clearable
            @keyup.enter="loadData"
          />
        </el-form-item>
        <el-form-item :label="t('common.field.status')">
          <el-select v-model="queryParams.status" clearable class="filter-select">
            <el-option :label="t('common.status.enabled')" :value="1" />
            <el-option :label="t('common.status.disabled')" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="loadData">{{ t('common.action.search') }}</el-button>
          <el-button :icon="Refresh" @click="resetQuery">{{ t('common.action.reset') }}</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-wrap">
      <template #header>
        <div class="action-bar">
          <el-button type="primary" :icon="Plus" @click="handleCreate">{{ t('system.user.addUser') }}</el-button>
          <el-button :icon="Refresh" @click="loadData">{{ t('common.action.refresh') }}</el-button>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" border row-key="id">
        <el-table-column prop="id" :label="t('common.field.id')" min-width="90" />
        <el-table-column prop="username" :label="t('system.user.username')" min-width="140" />
        <el-table-column prop="nickname" :label="t('system.user.nickname')" min-width="140" />
        <el-table-column prop="email" :label="t('system.user.email')" min-width="180" />
        <el-table-column prop="phone" :label="t('system.user.phone')" min-width="140" />
        <el-table-column :label="t('system.user.department')" min-width="140">
          <template #default="{ row }">
            {{ row.dept?.name || '-' }}
          </template>
        </el-table-column>
        <el-table-column :label="t('system.user.roles')" min-width="200">
          <template #default="{ row }">
            <div class="tag-list">
              <el-tag v-for="role in row.roles || []" :key="role.id" effect="plain" size="small">{{ role.name }}</el-tag>
              <span v-if="!(row.roles?.length)">-</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="t('common.field.status')" width="110">
          <template #default="{ row }">
            <el-switch
              :model-value="row.status === 1"
              @change="(value: string | number | boolean) => handleStatusChange(row, Boolean(value) ? 1 : 0)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" :label="t('common.field.createTime')" min-width="180" />
        <el-table-column :label="t('common.field.actions')" width="240" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" size="small" :icon="Edit" @click="handleEdit(row)">
              {{ t('common.action.edit') }}
            </el-button>
            <el-button text type="warning" size="small" :icon="Lock" @click="handleResetPwd(row)">
              {{ t('common.action.resetPwd') }}
            </el-button>
            <el-button text type="danger" size="small" :icon="Delete" @click="handleDelete(row)">
              {{ t('common.action.delete') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.limit"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="form.id ? t('system.user.editUser') : t('system.user.addUser')" width="720px">
      <el-form :model="form" label-width="100px" class="dialog-form">
        <el-form-item v-if="!form.id" :label="t('system.user.username')">
          <el-input v-model="form.username" />
        </el-form-item>
        <el-form-item v-if="!form.id" :label="t('system.user.password')">
          <el-input v-model="form.password" type="password" show-password autocomplete="new-password" />
        </el-form-item>
        <el-form-item :label="t('system.user.nickname')">
          <el-input v-model="form.nickname" />
        </el-form-item>
        <el-form-item :label="t('system.user.email')">
          <el-input v-model="form.email" />
        </el-form-item>
        <el-form-item :label="t('system.user.phone')">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item :label="t('system.user.department')">
          <el-tree-select
            v-model="form.deptId"
            :data="deptTree"
            :props="{ label: 'name', children: 'children' }"
            value-key="id"
            check-strictly
            clearable
            :placeholder="t('system.user.selectDepartment')"
          />
        </el-form-item>
        <el-form-item :label="t('system.user.posts')">
          <el-select v-model="form.postIds" multiple clearable :placeholder="t('system.user.selectPosts')">
            <el-option v-for="post in postOptions" :key="post.id" :label="post.name" :value="post.id" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('system.user.roles')">
          <el-select v-model="form.roleIds" multiple clearable :placeholder="t('system.user.selectRoles')">
            <el-option v-for="role in roleOptions" :key="role.id" :label="role.name" :value="role.id" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('common.field.status')">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">{{ t('common.status.enabled') }}</el-radio>
            <el-radio :value="0">{{ t('common.status.disabled') }}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">{{ t('common.action.cancel') }}</el-button>
        <el-button type="primary" @click="handleSubmit">{{ t('common.action.confirm') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { Delete, Edit, Lock, Plus, Refresh, Search } from '@element-plus/icons-vue';
import { useI18n } from 'vue-i18n';
import { deptApi } from '@/api/system/dept';
import { postApi } from '@/api/system/post';
import { roleApi } from '@/api/system/role';
import { userApi } from '@/api/system/user';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { UserStatus } from '@/types/user';

const { t } = useI18n();

const loading = ref(false);
const tableData = ref<any[]>([]);
const total = ref(0);
const queryParams = reactive({
  username: '',
  nickname: '',
  status: undefined as UserStatus | undefined,
  page: 1,
  limit: 10,
});

const dialogVisible = ref(false);
const deptTree = ref<any[]>([]);
const postOptions = ref<any[]>([]);
const roleOptions = ref<any[]>([]);

const form = reactive<any>({
  username: '',
  password: '',
  nickname: '',
  email: '',
  phone: '',
  deptId: undefined,
  postIds: [],
  roleIds: [],
  status: 1,
});

const loadData = async () => {
  loading.value = true;
  try {
    const res: any = await userApi.list(queryParams);
    tableData.value = res.items || [];
    total.value = res.total || 0;
  } catch {
    ElMessage.error(t('common.message.loadFailed'));
  } finally {
    loading.value = false;
  }
};

const loadDeptTree = async () => {
  const res: any = await deptApi.tree();
  deptTree.value = res;
};
const loadOptions = async () => {
  const [postRes, roleRes]: any[] = await Promise.all([
    postApi.list({ page: 1, limit: 1000 }),
    roleApi.list({ page: 1, limit: 1000 }),
  ]);
  postOptions.value = postRes.items || [];
  roleOptions.value = roleRes.items || [];
};

const parsePostIds = (value: unknown) => {
  if (Array.isArray(value)) return value.map(Number);
  if (typeof value === 'string' && value) {
    try {
      return JSON.parse(value).map(Number);
    } catch {
      return [];
    }
  }
  return [];
};

const resetQuery = () => {
  queryParams.username = '';
  queryParams.nickname = '';
  queryParams.status = undefined;
  queryParams.page = 1;
  loadData();
};

const handleCreate = () => {
  Object.assign(form, {
    id: undefined,
    username: '',
    password: '',
    nickname: '',
    email: '',
    phone: '',
    deptId: undefined,
    postIds: [],
    roleIds: [],
    status: 1,
  });
  dialogVisible.value = true;
};

const handleEdit = (row: any) => {
  Object.assign(form, {
    id: row.id,
    username: row.username,
    password: '',
    nickname: row.nickname,
    email: row.email,
    phone: row.phone,
    deptId: row.deptId,
    postIds: parsePostIds(row.postIds),
    roleIds: (row.roles || []).map((role: any) => Number(role.id)),
    status: row.status,
  });
  dialogVisible.value = true;
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
      await userApi.assignRoles(form.id, (form.roleIds || []).map(String));
      ElMessage.success(t('common.message.updateSuccess'));
    } else {
      delete payload.id;
      delete payload.postIds;
      delete payload.roleIds;
      const created: any = await userApi.create(payload);
      if (form.roleIds?.length && created?.id) await userApi.assignRoles(created.id, form.roleIds.map(String));
      ElMessage.success(t('common.message.addSuccess'));
    }
    dialogVisible.value = false;
    loadData();
  } catch (e: any) {
    ElMessage.error(e.message || t('common.message.failed'));
  }
};

const handleStatusChange = async (row: any, status: UserStatus) => {
  try {
    await userApi.changeStatus(row.id, status);
    ElMessage.success(t('common.message.statusUpdateSuccess'));
  } catch (e: any) {
    row.status = status === 1 ? 0 : 1;
    ElMessage.error(e.message || t('common.message.failed'));
  }
};

const handleResetPwd = async (row: any) => {
  await ElMessageBox.confirm(
    t('common.message.confirmResetPwd', { name: row.username }),
    t('common.action.confirm'),
    { type: 'warning' },
  );
  await userApi.resetPassword(row.id);
  ElMessage.success(t('common.message.resetPwdSuccess'));
};

const handleDelete = async (row: any) => {
  await ElMessageBox.confirm(
    t('common.message.confirmDelete', { name: row.username }),
    t('common.action.confirm'),
    { type: 'warning' },
  );
  await userApi.delete(row.id);
  ElMessage.success(t('common.message.deleteSuccess'));
  loadData();
};

onMounted(() => {
  loadData();
  loadDeptTree();
  loadOptions();
});
</script>

<style scoped>
.page-container {
  padding: 16px;
}

.filter-form,
.table-wrap {
  margin-bottom: 16px;
}

.filter-select {
  width: 140px;
}

.action-bar {
  display: flex;
  gap: 12px;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.dialog-form :deep(.el-select),
.dialog-form :deep(.el-tree-select) {
  width: 100%;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
</style>
