/**
 * Mission 系统内嵌任务
 *
 * - 注册时通过 @Mission(name) 装饰器把处理函数写入全局 Registry
 * - TaskEntity.service 字段格式：'mission:<name>'
 * - 执行时 TasksService.runOnce() 会调用对应处理函数
 */
export type MissionHandler = (args?: Record<string, any>) => Promise<unknown> | unknown;

export interface MissionInfo {
  name: string;
  description: string;
}

/** 全局 registry: name -> handler + description */
interface RegistryEntry {
  handler: MissionHandler;
  description: string;
}

const registry = new Map<string, RegistryEntry>();

export function registerMission(name: string, handler: MissionHandler, description = ''): void {
  if (registry.has(name)) {
    throw new Error(`[Mission] duplicate registration: ${name}`);
  }
  registry.set(name, { handler, description });
}

export function getMission(name: string): RegistryEntry | undefined {
  return registry.get(name);
}

export function hasMission(name: string): boolean {
  return registry.has(name);
}

export function listMissions(): MissionInfo[] {
  return Array.from(registry.entries()).map(([name, entry]) => ({
    name,
    description: entry.description,
  }));
}
