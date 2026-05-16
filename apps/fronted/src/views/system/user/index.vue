<template>
  <div class="page-container">
    <!-- Search Bar -->
    <div class="search-bar">
      <el-input v-model="queryParams.username" placeholder="Username" style="width: 200px" clearable @clear="loadData" />
      <el-input v-model="queryParams.nickname" placeholder="Nickname" style="width: 200px" clearable @clear="loadData" />
      <el-select v-model="queryParams.status" placeholder="Status" style="width: 120px" clearable @clear="loadData">
        <el-option label="Enabled" :value="1" />
        <el-option label="Disabled" :value="0" />
      </el-select>
      <el-button type="primary" :icon="Search" @click="loadData">Search</el-button>
      <el-button :icon="Refresh" @click="resetQuery">Reset</el-button>
    </div>

    <!-- Toolbar -->
    <div class="toolbar">
      <el-button type="primary" :icon="Plus" @click="handleCreate">Add User</el-button>
    </div>

    <!-- Table -->
    <el-table :data="tableData" v-loading="loading" row-key="id">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="username" label="Username" />
      <el-table-column prop="nickname" label="Nickname" />
      <el-table-column prop="email" label="Email" />
      <el-table-column prop="phone" label="Phone" />
      <el-table-column prop="dept" label="Department" width="150">
        <template #default="{ row }">{{ row.dept?.name || '-' }}</template>
      </el-table-column>
      <el-table-column label="Roles" width="180">
        <template #default="{ row }">
          <el-tag v-for="role in row.roles || []" :key="role.id" size="small" style="margin-right: 4px">
            {{ role.name }}
          </el-tag>
          <span v-if="!row.roles?.length">-</span>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="Status" width="100">
        <template #default="{ row }">
          <el-switch
            v-model="row.status"
            :active-value="1"
            :inactive-value="0"
            @change="(status: number) => handleStatusChange(row, status)"
          />
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="Created" width="180" />
      <el-table-column label="Actions" width="280" fixed="right">
        <template #default="{ row }">
          <el-button size="small" type="primary" :icon="Edit" @click="handleEdit(row)">Edit</el-button>
          <el-button size="small" type="warning" :icon="Refresh" @click="handleResetPwd(row)">Reset Pwd</el-button>
          <el-button size="small" type="danger" :icon="Delete" @click="handleDelete(row)">Delete</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- Pagination -->
    <el-pagination
      v-model:current-page="queryParams.page"
      v-model:page-size="queryParams.limit"
      :total="total"
      :page-sizes="[10, 20, 50]"
      layout="total, sizes, prev, pager, next"
      @size-change="loadData"
      @current-change="loadData"
      style="margin-top: 16px"
    />

    <!-- Dialog -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="Username" prop="username" v-if="!form.id">
          <el-input v-model="form.username" />
        </el-form-item>
        <el-form-item label="Password" prop="password" v-if="!form.id">
          <el-input v-model="form.password" type="password" show-password />
        </el-form-item>
        <el-form-item label="Nickname" prop="nickname">
          <el-input v-model="form.nickname" />
        </el-form-item>
        <el-form-item label="Email" prop="email">
          <el-input v-model="form.email" />
        </el-form-item>
        <el-form-item label="Phone" prop="phone">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="Department">
          <el-tree-select
            v-model="form.deptId"
            :data="deptTree"
            :props="{ label: 'name', value: 'id', children: 'children' }"
            check-strictly
            clearable
            placeholder="Select department"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="Posts">
          <el-select v-model="form.postIds" multiple clearable placeholder="Select posts" style="width: 100%">
            <el-option v-for="post in postOptions" :key="post.id" :label="post.name" :value="post.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="Roles">
          <el-select v-model="form.roleIds" multiple clearable placeholder="Select roles" style="width: 100%">
            <el-option v-for="role in roleOptions" :key="role.id" :label="role.name" :value="role.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="Status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">Enabled</el-radio>
            <el-radio :label="0">Disabled</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="handleSubmit">Confirm</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { userApi, deptApi, postApi, roleApi } from '@/api';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Edit, Delete, Search, Refresh } from '@element-plus/icons-vue';
import type { FormInstance } from 'element-plus';

const loading = ref(false);
const tableData = ref<any[]>([]);
const total = ref(0);
const queryParams = reactive({ username: '', nickname: '', status: undefined as number | undefined, page: 1, limit: 10 });
const dialogVisible = ref(false);
const dialogTitle = ref('Add User');
const formRef = ref<FormInstance>();
const deptTree = ref<any[]>([]);
const postOptions = ref<any[]>([]);
const roleOptions = ref<any[]>([]);

const form = reactive<any>({ username: '', password: '', nickname: '', email: '', phone: '', deptId: undefined, postIds: [], roleIds: [], status: 1 });
const rules = {
  username: [{ required: true, message: 'Please enter username', trigger: 'blur' }],
  password: [{ required: true, min: 6, message: 'Password must be at least 6 characters', trigger: 'blur' }],
};

const loadData = async () => {
  loading.value = true;
  try {
    const res: any = await userApi.list(queryParams);
    tableData.value = res.items;
    total.value = res.total;
  } catch (e) {
    ElMessage.error('Failed to load data');
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
  loadData();
};

const handleCreate = () => {
  Object.assign(form, { id: undefined, username: '', password: '', nickname: '', email: '', phone: '', deptId: undefined, postIds: [], roleIds: [], status: 1 });
  dialogTitle.value = 'Add User';
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
  dialogTitle.value = 'Edit User';
  dialogVisible.value = true;
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (!valid) return;
    try {
      const payload = {
        id: form.id,
        username: form.username,
        password: form.password,
        nickname: form.nickname,
        email: form.email,
        phone: form.phone,
        deptId: form.deptId,
        postIds: form.postIds,
        status: form.status,
      };
      if (form.id) {
        const updatePayload: any = { ...payload };
        delete updatePayload.username;
        await userApi.update(updatePayload);
        await userApi.assignRoles(form.id, form.roleIds || []);
        ElMessage.success('Updated successfully');
      } else {
        const createPayload: any = { ...payload };
        delete createPayload.id;
        const created: any = await userApi.create(createPayload);
        if (form.roleIds?.length && created?.id) {
          await userApi.assignRoles(created.id, form.roleIds);
        }
        ElMessage.success('Created successfully');
      }
      dialogVisible.value = false;
      loadData();
    } catch (e: any) {
      ElMessage.error(e.message || 'Operation failed');
    }
  });
};

const handleStatusChange = async (row: any, status: number) => {
  try {
    await userApi.changeStatus(row.id, status);
    ElMessage.success('Status updated');
  } catch (e: any) {
    row.status = status === 1 ? 0 : 1;
    ElMessage.error(e.message || 'Operation failed');
  }
};

const handleResetPwd = async (row: any) => {
  await ElMessageBox.confirm(`Reset password for user "${row.username}"?`, 'Confirm', { type: 'warning' });
  await userApi.resetPassword(row.id);
  ElMessage.success('Password reset to: admin123');
};

const handleDelete = async (row: any) => {
  await ElMessageBox.confirm(`Delete user "${row.username}"?`, 'Confirm', { type: 'warning' });
  await userApi.delete(row.id);
  ElMessage.success('Deleted successfully');
  loadData();
};

onMounted(() => {
  loadData();
  loadDeptTree();
  loadOptions();
});
</script>

<style scoped>
.search-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.toolbar {
  margin-bottom: 16px;
}
</style>
