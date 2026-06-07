<template>
  <div class="page-container">
    <el-card class="filter-form">
      <el-form :inline="true" :model="queryParams">
        <el-form-item :label="t('system.dept.deptName')">
          <el-input v-model="queryParams.name" :placeholder="t('system.dept.placeholderName')" clearable @keyup.enter="loadData" />
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
          <el-button type="primary" :icon="Plus" @click="handleCreate">{{ t('system.dept.addDept') }}</el-button>
          <el-button :icon="Refresh" @click="loadData">{{ t('common.action.refresh') }}</el-button>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" border row-key="id" default-expand-all>
        <el-table-column prop="name" :label="t('system.dept.deptName')" min-width="220" />
        <el-table-column prop="sort" :label="t('common.field.sort')" width="100" />
        <el-table-column :label="t('common.field.status')" width="120">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" effect="plain">
              {{ row.status === 1 ? t('common.status.enabled') : t('common.status.disabled') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="t('common.field.actions')" width="180" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" size="small" :icon="Edit" @click="handleEdit(row)">
              {{ t('common.action.edit') }}
            </el-button>
            <el-button text type="danger" size="small" :icon="Delete" :disabled="row.children?.length > 0" @click="handleDelete(row)">
              {{ t('common.action.delete') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="form.id ? t('system.dept.editDept') : t('system.dept.addDept')" width="600px">
      <el-form :model="form" label-width="100px" class="dialog-form">
        <el-form-item :label="t('system.dept.parent')">
          <el-tree-select
            v-model="form.parentId"
            :data="deptTreeData"
            :props="{ label: 'name', children: 'children' }"
            value-key="id"
            check-strictly
            clearable
            :placeholder="t('system.dept.rootDept')"
          />
        </el-form-item>
        <el-form-item :label="t('system.dept.deptName')">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item :label="t('common.field.sort')">
          <el-input-number v-model="form.sort" :min="0" :max="9999" />
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
import { Delete, Edit, Plus, Refresh, Search } from '@element-plus/icons-vue';
import { useI18n } from 'vue-i18n';
import { deptApi } from '@/api/system/dept';
import { ElMessage, ElMessageBox } from 'element-plus';

const { t } = useI18n();

const loading = ref(false);
const tableData = ref<any[]>([]);
const deptTreeData = ref<any[]>([]);
const dialogVisible = ref(false);
const queryParams = reactive({ name: '', status: undefined as number | undefined });
const form = reactive<any>({ id: undefined, parentId: 0, name: '', sort: 0, status: 1 });

const loadData = async () => {
  loading.value = true;
  try {
    const res: any = await deptApi.list(queryParams);
    tableData.value = res;
    deptTreeData.value = [{ id: 0, name: t('system.dept.rootDept'), children: res }];
  } catch {
    ElMessage.error(t('common.message.loadFailed'));
  } finally {
    loading.value = false;
  }
};

const resetQuery = () => {
  queryParams.name = '';
  queryParams.status = undefined;
  loadData();
};

const handleCreate = () => {
  Object.assign(form, { id: undefined, parentId: 0, name: '', sort: 0, status: 1 });
  dialogVisible.value = true;
};

const handleEdit = (row: any) => {
  Object.assign(form, { id: row.id, parentId: row.parentId, name: row.name, sort: row.sort, status: row.status });
  dialogVisible.value = true;
};

const handleSubmit = async () => {
  try {
    if (form.id) {
      await deptApi.update(form);
      ElMessage.success(t('common.message.updateSuccess'));
    } else {
      await deptApi.create(form);
      ElMessage.success(t('common.message.addSuccess'));
    }
    dialogVisible.value = false;
    loadData();
  } catch (e: any) {
    ElMessage.error(e.message || t('common.message.failed'));
  }
};

const handleDelete = async (row: any) => {
  await ElMessageBox.confirm(t('common.message.confirmDelete', { name: row.name }), t('common.action.confirm'), { type: 'warning' });
  await deptApi.delete(row.id);
  ElMessage.success(t('common.message.deleteSuccess'));
  loadData();
};

onMounted(() => loadData());
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

.dialog-form :deep(.el-tree-select) {
  width: 100%;
}
</style>
