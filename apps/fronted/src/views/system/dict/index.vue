<template>
  <div class="page-container">
    <el-row :gutter="16">
      <!-- Dict Type Panel -->
      <el-col :span="8">
        <el-card header="Dict Types">
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center">
              <span>Dict Types</span>
              <el-button type="primary" :icon="Plus" size="small" @click="handleCreateType">Add</el-button>
            </div>
          </template>
          <el-table :data="typeList" size="small" highlight-current-row @row-click="loadDataItems" row-key="id" :show-overflow-tooltip="true" style="width: 100%">
            <el-table-column prop="name" label="Name" />
            <el-table-column prop="code" label="Code" width="150" />
            <el-table-column prop="status" label="Status" width="80">
              <template #default="{ row }">
                <el-tag size="small" :type="row.status === 1 ? 'success' : 'danger'">{{ row.status === 1 ? 'On' : 'Off' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="Actions" width="120">
              <template #default="{ row }">
                <el-button size="small" type="primary" :icon="Edit" @click.stop="handleEditType(row)" text />
                <el-button size="small" type="danger" :icon="Delete" @click.stop="handleDeleteType(row)" text />
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- Dict Data Panel -->
      <el-col :span="16">
        <el-card header="Dict Data">
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center">
              <span>Dict Data {{ currentTypeId ? `(${currentTypeName})` : '' }}</span>
              <el-button type="primary" :icon="Plus" size="small" :disabled="!currentTypeId" @click="handleCreateData">Add</el-button>
            </div>
          </template>
          <el-table :data="dataList" size="small" v-loading="loading" style="width: 100%">
            <el-table-column prop="label" label="Label" />
            <el-table-column prop="value" label="Value" width="150" />
            <el-table-column prop="sort" label="Sort" width="80" />
            <el-table-column prop="status" label="Status" width="80">
              <template #default="{ row }">
                <el-tag size="small" :type="row.status === 1 ? 'success' : 'danger'">{{ row.status === 1 ? 'On' : 'Off' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="Actions" width="120">
              <template #default="{ row }">
                <el-button size="small" type="primary" :icon="Edit" @click="handleEditData(row)" text />
                <el-button size="small" type="danger" :icon="Delete" @click="handleDeleteData(row)" text />
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- Type Dialog -->
    <el-dialog v-model="typeDialogVisible" :title="typeDialogTitle" width="500px">
      <el-form ref="typeFormRef" :model="typeForm" :rules="typeRules" label-width="100px">
        <el-form-item label="Name" prop="name"><el-input v-model="typeForm.name" /></el-form-item>
        <el-form-item label="Code" prop="code"><el-input v-model="typeForm.code" :disabled="!!typeForm.id" /></el-form-item>
        <el-form-item label="Status">
          <el-radio-group v-model="typeForm.status">
            <el-radio :label="1">Enabled</el-radio>
            <el-radio :label="0">Disabled</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="Remark"><el-input v-model="typeForm.remark" type="textarea" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="typeDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="handleTypeSubmit">Confirm</el-button>
      </template>
    </el-dialog>

    <!-- Data Dialog -->
    <el-dialog v-model="dataDialogVisible" :title="dataDialogTitle" width="500px">
      <el-form ref="dataFormRef" :model="dataForm" :rules="dataRules" label-width="100px">
        <el-form-item label="Label" prop="label"><el-input v-model="dataForm.label" /></el-form-item>
        <el-form-item label="Value" prop="value"><el-input v-model="dataForm.value" /></el-form-item>
        <el-form-item label="Sort"><el-input-number v-model="dataForm.sort" :min="0" /></el-form-item>
        <el-form-item label="Status">
          <el-radio-group v-model="dataForm.status"><el-radio :label="1">Enabled</el-radio><el-radio :label="0">Disabled</el-radio></el-radio-group>
        </el-form-item>
        <el-form-item label="Remark"><el-input v-model="dataForm.remark" type="textarea" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dataDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="handleDataSubmit">Confirm</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { dictApi } from '@/api';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Edit, Delete } from '@element-plus/icons-vue';
import type { FormInstance } from 'element-plus';

const loading = ref(false);
const typeList = ref<any[]>([]);
const dataList = ref<any[]>([]);
const currentTypeId = ref<number>();
const currentTypeName = ref('');
const typeDialogVisible = ref(false);
const dataDialogVisible = ref(false);
const typeDialogTitle = ref('Add Dict Type');
const dataDialogTitle = ref('Add Dict Data');
const typeFormRef = ref<FormInstance>();
const dataFormRef = ref<FormInstance>();

const typeForm = reactive<any>({ id: undefined, name: '', code: '', status: 1, remark: '' });
const dataForm = reactive<any>({ id: undefined, dictTypeId: 0, label: '', value: '', sort: 0, status: 1, remark: '' });
const typeRules = { name: [{ required: true }], code: [{ required: true }] };
const dataRules = { label: [{ required: true }], value: [{ required: true }] };

const loadTypes = async () => {
  const res: any = await dictApi.typeList({});
  typeList.value = res;
};

const loadDataItems = async (row: any) => {
  currentTypeId.value = row.id;
  currentTypeName.value = row.name;
  loading.value = true;
  try {
    const res: any = await dictApi.dataList(row.id);
    dataList.value = res;
  } catch { ElMessage.error('Failed to load dict data'); }
  finally { loading.value = false; }
};

const handleCreateType = () => { Object.assign(typeForm, { id: undefined, name: '', code: '', status: 1, remark: '' }); typeDialogTitle.value = 'Add Dict Type'; typeDialogVisible.value = true; };
const handleEditType = (row: any) => { Object.assign(typeForm, row); typeDialogTitle.value = 'Edit Dict Type'; typeDialogVisible.value = true; };

const handleTypeSubmit = async () => {
  if (!typeFormRef.value) return;
  await typeFormRef.value.validate(async (valid) => {
    if (!valid) return;
    try {
      if (typeForm.id) {
        await dictApi.typeUpdate({ id: typeForm.id, name: typeForm.name, status: typeForm.status, remark: typeForm.remark });
        ElMessage.success('Updated');
      }
      else {
        await dictApi.typeCreate({ name: typeForm.name, code: typeForm.code, status: typeForm.status, remark: typeForm.remark });
        ElMessage.success('Created');
      }
      typeDialogVisible.value = false;
      loadTypes();
    } catch (e: any) { ElMessage.error(e.message); }
  });
};

const handleDeleteType = async (row: any) => {
  await ElMessageBox.confirm(`Delete "${row.name}"?`, 'Confirm', { type: 'warning' });
  await dictApi.typeDelete(row.id);
  ElMessage.success('Deleted');
  if (currentTypeId.value === row.id) { currentTypeId.value = undefined; dataList.value = []; }
  loadTypes();
};

const handleCreateData = () => { Object.assign(dataForm, { id: undefined, dictTypeId: currentTypeId.value, label: '', value: '', sort: 0, status: 1, remark: '' }); dataDialogTitle.value = 'Add Dict Data'; dataDialogVisible.value = true; };
const handleEditData = (row: any) => { Object.assign(dataForm, { id: row.id, dictTypeId: row.dictTypeId, label: row.label, value: row.value, sort: row.sort, status: row.status, remark: row.remark }); dataDialogTitle.value = 'Edit Dict Data'; dataDialogVisible.value = true; };

const handleDataSubmit = async () => {
  if (!dataFormRef.value) return;
  await dataFormRef.value.validate(async (valid) => {
    if (!valid) return;
    try {
      if (dataForm.id) { await dictApi.dataUpdate(dataForm); ElMessage.success('Updated'); }
      else { await dictApi.dataCreate(dataForm); ElMessage.success('Created'); }
      dataDialogVisible.value = false;
      if (currentTypeId.value) loadDataItems({ id: currentTypeId.value, name: currentTypeName.value });
    } catch (e: any) { ElMessage.error(e.message); }
  });
};

const handleDeleteData = async (row: any) => {
  await ElMessageBox.confirm(`Delete "${row.label}"?`, 'Confirm', { type: 'warning' });
  await dictApi.dataDelete(row.id);
  ElMessage.success('Deleted');
  if (currentTypeId.value) loadDataItems({ id: currentTypeId.value, name: currentTypeName.value });
};

onMounted(() => loadTypes());
</script>

<style scoped>

</style>
