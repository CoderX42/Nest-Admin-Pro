<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app';
import { redirectToLoginIfNeeded, setupRouterGuard } from '@/utils/router-guard';

onLaunch(() => {
  setupRouterGuard();
  redirectToLoginIfNeeded();
});
</script>

<style></style>
