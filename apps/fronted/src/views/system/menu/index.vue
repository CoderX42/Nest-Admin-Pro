<template>
  <div class="page-container">
    <div class="search-bar">
      <el-input v-model="queryParams.name" placeholder="Menu Name" style="width: 200px" clearable @clear="loadData" />
      <el-select v-model="queryParams.type" placeholder="Type" style="width: 120px" clearable @clear="loadData">
        <el-option label="Directory" :value="1" />
        <el-option label="Menu" :value="2" />
        <el-option label="Button" :value="3" />
      </el-select>
      <el-select v-model="queryParams.status" placeholder="Status" style="width: 120px" clearable @clear="loadData">
        <el-option label="Enabled" :value="1" />
        <el-option label="Disabled" :value="0" />
      </el-select>
      <el-button type="primary" :icon="Search" @click="loadData">Search</el-button>
      <el-button :icon="Refresh" @click="resetQuery">Reset</el-button>
    </div>

    <div class="toolbar">
      <el-button type="primary" :icon="Plus" @click="handleCreate(0)">Add Menu</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" row-key="id" default-expand-all>
      <el-table-column prop="name" label="Menu Name" width="200" />
      <el-table-column prop="type" label="Type" width="100">
        <template #default="{ row }">
          <el-tag>{{ ['', 'Directory', 'Menu', 'Button'][row.type] }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="path" label="Path" />
      <el-table-column prop="component" label="Component" />
      <el-table-column prop="perms" label="Permission" width="180" />
      <el-table-column prop="icon" label="Icon" width="100" />
      <el-table-column prop="sort" label="Sort" width="80" />
      <el-table-column prop="status" label="Status" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'">{{ row.status === 1 ? 'Enabled' : 'Disabled' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Actions" width="220" fixed="right">
        <template #default="{ row }">
          <el-button size="small" type="primary" :icon="Plus" @click="handleCreate(row.id)" v-if="row.type !== 3">Add Child</el-button>
          <el-button size="small" type="primary" :icon="Edit" @click="handleEdit(row)">Edit</el-button>
          <el-button size="small" type="danger" :icon="Delete" @click="handleDelete(row)">Delete</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="Parent Menu">
          <el-tree-select
            v-model="form.parentId"
            :data="menuTree"
            :props="{ label: 'name', value: 'id', children: 'children' }"
            check-strictly
            clearable
            placeholder="Root menu"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="Type" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio :label="1">Directory</el-radio>
            <el-radio :label="2">Menu</el-radio>
            <el-radio :label="3">Button</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="Name" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="Path" prop="path" v-if="form.type !== 3">
          <el-input v-model="form.path" placeholder="/system/user" />
        </el-form-item>
        <el-form-item label="Component" v-if="form.type === 2">
          <el-input v-model="form.component" placeholder="@/views/system/user/index.vue" />
        </el-form-item>
        <el-form-item label="Permission" v-if="form.type === 3">
          <el-input v-model="form.perms" placeholder="system:user:delete" />
        </el-form-item>
        <el-form-item label="Icon" v-if="form.type !== 3">
          <el-input v-model="form.icon" placeholder="Element Plus icon name" />
        </el-form-item>
        <el-form-item label="Visible" v-if="form.type !== 3">
          <el-switch v-model="form.show" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="Keep Alive" v-if="form.type === 2">
          <el-switch v-model="form.keepAlive" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="Sort">
          <el-input-number v-model="form.sort" :min="0" :max="9999" />
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
import { menuApi } from '@/api';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Edit, Delete, Search, Refresh } from '@element-plus/icons-vue';
import type { FormInstance } from 'element-plus';

const loading = ref(false);
const tableData = ref<any[]>([]);
const menuTree = ref<any[]>([]);
const dialogVisible = ref(false);
const dialogTitle = ref('Add Menu');
const formRef = ref<FormInstance>();

const queryParams = reactive({ name: '', type: undefined as number | undefined, status: undefined as number | undefined });
const form = reactive<any>({ id: undefined, parentId: 0, type: 1, name: '', path: '', component: '', perms: '', icon: '', sort: 0, status: 1, show: 1, keepAlive: 0, external: 0 });
const rules = { name: [{ required: true, message: 'Please enter menu name', trigger: 'blur' }] };

const loadData = async () => {
  loading.value = true;
  try {
    const res: any = await menuApi.list(queryParams);
    tableData.value = res;
    await loadMenuTree();
  } catch (e) { ElMessage.error('Failed to load data'); }
  finally { loading.value = false; }
};

const loadMenuTree = async () => {
  const res: any = await menuApi.tree();
  menuTree.value = [{ id: 0, name: 'Root', children: res }];
};

const resetQuery = () => {
  queryParams.name = '';
  queryParams.type = undefined;
  queryParams.status = undefined;
  loadData();
};

const handleCreate = (parentId: number) => {
  Object.assign(form, { id: undefined, parentId: parentId || 0, type: 1, name: '', path: '', component: '', perms: '', icon: '', sort: 0, status: 1, show: 1, keepAlive: 0, external: 0 });
  dialogTitle.value = parentId ? 'Add Child Menu' : 'Add Menu';
  dialogVisible.value = true;
};

const handleEdit = (row: any) => {
  Object.assign(form, { id: row.id, parentId: row.parentId, type: row.type, name: row.name, path: row.path, component: row.component, perms: row.perms, icon: row.icon, sort: row.sort, status: row.status, show: row.show, keepAlive: row.keepAlive, external: row.external });
  dialogTitle.value = 'Edit Menu';
  dialogVisible.value = true;
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (!valid) return;
    try {
      if (form.id) { await menuApi.update(form); ElMessage.success('Updated successfully'); }
      else { await menuApi.create(form); ElMessage.success('Created successfully'); }
      dialogVisible.value = false;
      loadData();
    } catch (e: any) { ElMessage.error(e.message || 'Operation failed'); }
  });
};

const handleDelete = async (row: any) => {
  await ElMessageBox.confirm(`Delete menu "${row.name}"?`, 'Confirm', { type: 'warning' });
  await menuApi.delete(row.id);
  ElMessage.success('Deleted successfully');
  loadData();
};

onMounted(() => loadData());
</script>

<style scoped>
.page-container { background: #fff; padding: 20px; border-radius: 8px; }
.search-bar { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
.toolbar { margin-bottom: 16px; }
</style>
