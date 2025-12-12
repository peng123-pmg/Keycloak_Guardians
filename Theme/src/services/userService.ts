const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";

const getAuthToken = () => sessionStorage.getItem("kc_token") || localStorage.getItem("kc_token");

async function authorizedFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = getAuthToken();
  const headers = new Headers(init.headers);
  headers.set("Content-Type", headers.get("Content-Type") || "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return fetch(`${API_BASE_URL}${path}`, { ...init, headers });
}

export interface CurrentUserResponse {
  username: string;
  email?: string;
  roles: string[];
  userId: string;
  welcome: string;
}

export interface CreateGroupPayload {
  name: string;
  description?: string;
  courseCode?: string;
  joinPolicy?: string;
  memberLimit?: number;
}

export interface CreateGroupResponse {
  message: string;
  group: {
    id: number;
    name: string;
    description?: string;
    created: boolean;
  };
}

export interface GroupInfo {
  id: number;
  name: string;
  description?: string;
  courseCode?: string;
  joinPolicy?: string;
  memberLimit?: number;
  membershipRole?: string;
  isOwner?: boolean;
}

export interface GroupListResponse {
  message: string;
  total: number;
  groups: GroupInfo[];
}

export interface GroupMember {
  id: number;
  userId: number;
  username?: string;
  displayName?: string;
  email?: string;
  role: string;
  joinedAt: string;
}

export interface InviteMemberPayload {
  username: string;
  role?: string;
}

export interface DeleteFilePayload {
  fileId: number;
}

export const userService = {
  async getCurrentUser(): Promise<CurrentUserResponse> {
    const resp = await authorizedFetch("/api/users/me");
    if (!resp.ok) throw new Error("获取用户信息失败");
    return resp.json();
  },

  async downloadFile(fileId: number): Promise<Blob> {
    const resp = await authorizedFetch(`/api/files/${fileId}`, { method: "GET" });
    if (!resp.ok) throw new Error("下载失败");
    return resp.blob();
  },

  async deleteFile(fileId: number): Promise<void> {
    const resp = await authorizedFetch(`/api/files/${fileId}`, { method: "DELETE" });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ error: "删除失败" }));
      throw new Error(err.error || "删除失败");
    }
  },

  async getMyGroups(): Promise<GroupInfo[]> {
    const resp = await authorizedFetch("/api/groups");
    if (!resp.ok) throw new Error("获取小组列表失败");
    const data: GroupListResponse = await resp.json();
    return data.groups ?? [];
  },

  async createGroup(payload: CreateGroupPayload): Promise<CreateGroupResponse> {
    const resp = await authorizedFetch("/api/groups", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ error: "创建小组失败" }));
      throw new Error(err.error || "创建小组失败");
    }
    return resp.json();
  },

  async deleteGroup(groupId: number): Promise<void> {
    const resp = await authorizedFetch(`/api/groups/${groupId}`, {
      method: "DELETE",
    });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ error: "删除小组失败" }));
      throw new Error(err.error || "删除小组失败");
    }
  },

  async getGroupMembers(groupId: number): Promise<GroupMember[]> {
    const resp = await authorizedFetch(`/api/groups/${groupId}/members`);
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ error: "获取成员失败" }));
      throw new Error(err.error || "获取成员失败");
    }
    return resp.json();
  },

  async inviteGroupMember(groupId: number, payload: InviteMemberPayload): Promise<void> {
    const resp = await authorizedFetch(`/api/groups/${groupId}/members`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ error: "邀请失败" }));
      throw new Error(err.error || "邀请失败");
    }
  },
};
