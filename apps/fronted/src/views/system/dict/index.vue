<template>
  <div class="page-container">
    <el-row :gutter="16">
      <!-- Dict Type Panel -->
      <el-col :span="8">
        <el-card :header="t('system.dict.dictName')">
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center">
              <span>{{ t('system.dict.dictName') }}</span>
              <el-button type="primary" :icon="Plus" size="small" @click="handleCreateType">{{ t('common.action.add') }}</el-button>
            </div>
          </template>
          <el-table :data="typeList" size="small" highlight-current-row @row-click="loadDataItems" row-key="id" :show-overflow-tooltip="true" style="width: 100%">
            <el-table-column prop="name" :label="t('system.dict.dictName')" />
            <el-table-column prop="code" :label="t('system.dict.dictCode')" width="150" />
            <el-table-column prop="status" :label="t('common.field.status')" width="80">
              <template #default="{ row }">
                <el-tag size="small" :type="row.status === 1 ? 'success' : 'danger'"
                >{{ row.status === 1 ? t('common.status.enabled') : t('common.status.disabled') }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column :label="t('common.field.actions')" width="120">
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
        <el-card :header="t('system.dict.dictData')">
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center">
              <span>{{ t('system.dict.dictData') }} {{ currentTypeId ? `(${currentTypeName})` : '' }}</span>
              <el-button type="primary" :icon="Plus" size="small" :disabled="!currentTypeId" @click="handleCreateData">{{ t('common.action.add') }}</el-button>
            </div>
          </template>
          <el-table :data="dataList" size="small" v-loading="loading" style="width: 100%">
            <el-table-column prop="label" :label="t('system.dict.label')" />
            <el-table-column prop="value" :label="t('system.dict.value')" width="150" />
            <el-table-column prop="sort" :label="t('common.field.sort')" width="80" />
            <el-table-column prop="status" :label="t('common.field.status')" width="80">
              <template #default="{ row }">
                <el-tag size="small" :type="row.status === 1 ? 'success' : 'danger'"
                >{{ row.status === 1 ? t('common.status.enabled') : t('common.status.disabled') }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column :label="t('common.field.actions')" width="120">
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
    <el-dialog v-model="typeDialogVisible" :title="typeForm.id ? t('system.dict.editDict') : t('system.dict.addDict')" width="500px">
      <el-form ref="typeFormRef" :model="typeForm" :rules="typeRules" label-width="100px">
        <el-form-item :label="t('system.dict.dictName')" prop="name"><el-input v-model="typeForm.name" /></el-form-item>
        <el-form-item :label="t('system.dict.dictCode')" prop="code"><el-input v-model="typeForm.code" :disabled="!!typeForm.id" /></el-form-item>
        <el-form-item :label="t('common.field.status')">
          <el-radio-group v-model="typeForm.status">
            <el-radio :label="1">{{ t('common.status.enabled') }}</el-radio>
            <el-radio :label="0">{{ t('common.status.disabled') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="t('common.field.remark')"><el-input v-model="typeForm.remark" type="textarea" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="typeDialogVisible = false">{{ t('common.action.cancel') }}</el-button>
        <el-button type="primary" @click="handleTypeSubmit">{{ t('common.action.confirm') }}</el-button>
      </template>
    </el-dialog>

    <!-- Data Dialog -->
    <el-dialog v-model="dataDialogVisible" :title="dataForm.id ? t('system.dict.editData') : t('system.dict.addData')" width="500px">
      <el-form ref="dataFormRef" :model="dataForm" :rules="dataRules" label-width="100px">
        <el-form-item :label="t('system.dict.label')" prop="label"><el-input v-model="dataForm.label" /></el-form-item>
        <el-form-item :label="t('system.dict.value')" prop="value"><el-input v-model="dataForm.value" /></el-form-item>
        <el-form-item :label="t('common.field.sort')"><el-input-number v-model="dataForm.sort" :min="0" /></el-form-item>
        <el-form-item :label="t('common.field.status')">
          <el-radio-group v-model="dataForm.status"><el-radio :label="1">{{ t('common.status.enabled') }}</el-radio><el-radio :label="0">{{ t('common.status.disabled') }}</el-radio></el-radio-group>
        </el-form-item>
        <el-form-item :label="t('common.field.remark')"><el-input v-model="dataForm.remark" type="textarea" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dataDialogVisible = false">{{ t('common.action.cancel') }}</el-button>
        <el-button type="primary" @click="handleDataSubmit">{{ t('common.action.confirm') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { dictApi } from '@/api';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Edit, Delete } from '@element-plus/icons-vue';
import type { FormInstance } from 'element-plus';

const { t } = useI18n();

const loading = ref(false);
const typeList = ref<any[]>([]);
const dataList = ref<any[]>([]);
const currentTypeId = ref<number>();
const currentTypeName = ref('');
const typeDialogVisible = ref(false);
const dataDialogVisible = ref(false);
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
  } catch { ElMessage.error(t('common.message.loadFailed')); }
  finally { loading.value = false; }
};

const handleCreateType = () => { Object.assign(typeForm, { id: undefined, name: '', code: '', status: 1, remark: '' }); typeDialogVisible.value = true; };
const handleEditType = (row: any) => { Object.assign(typeForm, row); typeDialogVisible.value = true; };

const handleTypeSubmit = async () => {
  if (!typeFormRef.value) return;
  await typeFormRef.value.validate(async (valid) => {
    if (!valid) return;
    try {
      if (typeForm.id) {
        await dictApi.typeUpdate({ id: typeForm.id, name: typeForm.name, status: typeForm.status, remark: typeForm.remark });
        ElMessage.success(t('common.message.updateSuccess'));
      }
      else {
        await dictApi.typeCreate({ name: typeForm.name, code: typeForm.code, status: typeForm.status, remark: typeForm.remark });
        ElMessage.success(t('common.message.addSuccess'));
      }
      typeDialogVisible.value = false;
      loadTypes();
    } catch (e: any) { ElMessage.error(e.message); }
  });
};

const handleDeleteType = async (row: any) => {
  await ElMessageBox.confirm(t('common.message.confirmDelete', { name: row.name }), t('common.action.confirm'), { type: 'warning' });
  await dictApi.typeDelete(row.id);
  ElMessage.success(t('common.message.deleteSuccess'));
  if (currentTypeId.value === row.id) { currentTypeId.value = undefined; dataList.value = []; }
  loadTypes();
};

const handleCreateData = () => { Object.assign(dataForm, { id: undefined, dictTypeId: currentTypeId.value, label: '', value: '', sort: 0, status: 1, remark: '' }); dataDialogVisible.value = true; };
const handleEditData = (row: any) => { Object.assign(dataForm, { id: row.id, dictTypeId: row.dictTypeId, label: row.label, value: row.value, sort: row.sort, status: row.status, remark: row.remark }); dataDialogVisible.value = true; };

const handleDataSubmit = async () => {
  if (!dataFormRef.value) return;
  await dataFormRef.value.validate(async (valid) => {
    if (!valid) return;
    try {
      if (dataForm.id) { await dictApi.dataUpdate(dataForm); ElMessage.success(t('common.message.updateSuccess')); }
      else { await dictApi.dataCreate(dataForm); ElMessage.success(t('common.message.addSuccess')); }
      dataDialogVisible.value = false;
      if (currentTypeId.value) loadDataItems({ id: currentTypeId.value, name: currentTypeName.value });
    } catch (e: any) { ElMessage.error(e.message); }
  });
};

const handleDeleteData = async (row: any) => {
  await ElMessageBox.confirm(t('common.message.confirmDelete', { name: row.label }), t('common.action.confirm'), { type: 'warning' });
  await dictApi.dataDelete(row.id);
  ElMessage.success(t('common.message.deleteSuccess'));
  if (currentTypeId.value) loadDataItems({ id: currentTypeId.value, name: currentTypeName.value });
};

onMounted(() => loadTypes());
</script>

<style scoped>

</style>