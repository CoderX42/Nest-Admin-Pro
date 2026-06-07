<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="page-header">
          <div>
            <div class="page-title">任务管理</div>
            <div class="page-desc">管理系统定时任务,支持 cron 表达式调度</div>
          </div>
        </div>
      </template>
      <el-empty description="定时任务模块开发中" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
// Placeholder for scheduled jobs management (S6).
// Backend api/job/job.controller.ts is not yet wired.
</script>

<style scoped>
.page-container {
  padding: 16px;
}
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.page-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.page-desc {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
}
</style>
