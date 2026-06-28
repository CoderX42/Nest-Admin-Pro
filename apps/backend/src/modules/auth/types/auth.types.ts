/** 登录返回的双令牌结构 */
export interface ITokenPairResponse {
  accessToken: string;
  refreshToken: string;
  accessExpiresIn: number;
  refreshExpiresIn: number;
}

/** 当前登录用户信息（前端 /me 使用） */
export interface IUserInfo {
  uid: number;
  username: string;
  nickname: string;
  avatar?: string;
  email?: string;
  phone?: string;
  roles: string[];
  permissions: string[];
  menus: IMenuItem[];
  deptId?: number;
}

/** 菜单结构（前端渲染侧边栏） */
export interface IMenuItem {
  id: number;
  parentId: number;
  name: string;
  title: string;
  path: string;
  component?: string;
  icon?: string;
  type: number;
  perm?: string;
  sort: number;
  hide: boolean;
  children?: IMenuItem[];
}
