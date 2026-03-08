import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  ContactSubmission,
  Property,
  SmartFinanceRequest,
  UserApprovalInfo,
} from "../backend.d";
import type { PropertyStatus, SmartFinanceRole } from "../backend.d";
import { useActor } from "./useActor";

// Re-export ApprovalStatus as a local enum since backend.d.ts doesn't export it
export enum ApprovalStatus {
  approved = "approved",
  pending = "pending",
  rejected = "rejected",
}

// Admin token for local session (username/password) based admin access
const ADMIN_SESSION_TOKEN = "takshvi-admin-ku-2024";

// Helper to detect if local admin session is active
function useIsLocalAdminSession(): boolean {
  return sessionStorage.getItem("takshvi_admin_session") === "true";
}

// ─── Auth / Role Queries ───────────────────────────────────────────────────

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isCallerAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsCallerApproved() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isCallerApproved"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerApproved();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsCallerFinanceApproved() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isCallerFinanceApproved"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerFinanceApproved();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Admin Queries ─────────────────────────────────────────────────────────

export function useListApprovals() {
  const { actor, isFetching } = useActor();
  const isLocalAdmin = useIsLocalAdminSession();
  return useQuery<UserApprovalInfo[]>({
    queryKey: ["listApprovals", isLocalAdmin],
    queryFn: async () => {
      if (!actor) return [];
      if (isLocalAdmin)
        return actor.listApprovalsWithToken(ADMIN_SESSION_TOKEN);
      return actor.listApprovals();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetSmartFinanceRequests() {
  const { actor, isFetching } = useActor();
  const isLocalAdmin = useIsLocalAdminSession();
  return useQuery<SmartFinanceRequest[]>({
    queryKey: ["smartFinanceRequests", isLocalAdmin],
    queryFn: async () => {
      if (!actor) return [];
      if (isLocalAdmin)
        return actor.getSmartFinanceRequestsWithToken(ADMIN_SESSION_TOKEN);
      return actor.getSmartFinanceRequests();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllContactSubmissions() {
  const { actor, isFetching } = useActor();
  const isLocalAdmin = useIsLocalAdminSession();
  return useQuery<ContactSubmission[]>({
    queryKey: ["contactSubmissions", isLocalAdmin],
    queryFn: async () => {
      if (!actor) return [];
      if (isLocalAdmin)
        return actor.getAllContactSubmissionsWithToken(ADMIN_SESSION_TOKEN);
      return actor.getAllContactSubmissions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetFinanceRoles() {
  const { actor, isFetching } = useActor();
  const isLocalAdmin = useIsLocalAdminSession();
  return useQuery<[Principal, SmartFinanceRole][]>({
    queryKey: ["financeRoles", isLocalAdmin],
    queryFn: async () => {
      if (!actor) return [];
      if (isLocalAdmin)
        return actor.getFinanceRolesWithToken(ADMIN_SESSION_TOKEN);
      return actor.getFinanceRoles();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────

export function useRequestApproval() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      return actor.requestApproval();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["isCallerApproved"] });
      queryClient.invalidateQueries({ queryKey: ["listApprovals"] });
    },
  });
}

export function useRequestSmartFinanceAccess() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      message,
      timestamp,
    }: { message: string; timestamp: bigint }) => {
      if (!actor) throw new Error("Not connected");
      return actor.requestSmartFinanceAccess(message, timestamp);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["smartFinanceRequests"] });
    },
  });
}

export function useSetApproval() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      user,
      status,
    }: { user: Principal; status: ApprovalStatus }) => {
      if (!actor) throw new Error("Not connected");
      return actor.setApproval(user, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listApprovals"] });
      queryClient.invalidateQueries({ queryKey: ["isCallerApproved"] });
    },
  });
}

export function useSetSmartFinanceRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      user,
      role,
    }: { user: Principal; role: SmartFinanceRole }) => {
      if (!actor) throw new Error("Not connected");
      return actor.setSmartFinanceRole(user, role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financeRoles"] });
      queryClient.invalidateQueries({ queryKey: ["smartFinanceRequests"] });
      queryClient.invalidateQueries({ queryKey: ["isCallerFinanceApproved"] });
    },
  });
}

export function useSubmitContactSubmission() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      name,
      email,
      phone,
      message,
    }: {
      name: string;
      email: string;
      phone: string;
      message: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.submitContactSubmission(name, email, phone, message);
    },
  });
}

// ─── Property Queries ──────────────────────────────────────────────────────

export function useGetApprovedProperties() {
  const { actor, isFetching } = useActor();
  return useQuery<Property[]>({
    queryKey: ["approvedProperties"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getApprovedProperties();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMyProperties() {
  const { actor, isFetching } = useActor();
  return useQuery<Property[]>({
    queryKey: ["myProperties"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyProperties();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubmitProperty() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      description,
      location,
      valuation,
      locationLink,
      photos,
      timestamp,
    }: {
      title: string;
      description: string;
      location: string;
      valuation: string;
      locationLink: string;
      photos: string[];
      timestamp: bigint;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.submitProperty({
        title,
        description,
        location,
        valuation,
        locationLink,
        photos,
        timestamp,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myProperties"] });
      queryClient.invalidateQueries({ queryKey: ["approvedProperties"] });
    },
  });
}

export function useUpdateProperty() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      title,
      description,
      location,
      valuation,
      locationLink,
      photos,
      timestamp,
    }: {
      id: bigint;
      title: string;
      description: string;
      location: string;
      valuation: string;
      locationLink: string;
      photos: string[];
      timestamp: bigint;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateProperty(
        id,
        title,
        description,
        location,
        valuation,
        locationLink,
        photos,
        timestamp,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myProperties"] });
      queryClient.invalidateQueries({ queryKey: ["approvedProperties"] });
      queryClient.invalidateQueries({ queryKey: ["allProperties"] });
    },
  });
}

export function useAddPropertyPhoto() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, photoUrl }: { id: bigint; photoUrl: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addPropertyPhoto(id, photoUrl);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myProperties"] });
      queryClient.invalidateQueries({ queryKey: ["approvedProperties"] });
      queryClient.invalidateQueries({ queryKey: ["allProperties"] });
    },
  });
}

export function useRemovePropertyPhoto() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, photoUrl }: { id: bigint; photoUrl: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.removePropertyPhoto(id, photoUrl);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myProperties"] });
      queryClient.invalidateQueries({ queryKey: ["approvedProperties"] });
      queryClient.invalidateQueries({ queryKey: ["allProperties"] });
    },
  });
}

// ─── Admin Property Queries ────────────────────────────────────────────────

export function useGetAllProperties() {
  const { actor, isFetching } = useActor();
  const isLocalAdmin = useIsLocalAdminSession();
  return useQuery<Property[]>({
    queryKey: ["allProperties", isLocalAdmin],
    queryFn: async () => {
      if (!actor) return [];
      if (isLocalAdmin)
        return actor.getAllPropertiesWithToken(ADMIN_SESSION_TOKEN);
      return actor.getAllProperties();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetPropertyStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
      timestamp,
    }: {
      id: bigint;
      status: PropertyStatus;
      timestamp: bigint;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.setPropertyStatus(id, status, timestamp);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allProperties"] });
      queryClient.invalidateQueries({ queryKey: ["approvedProperties"] });
    },
  });
}

export function useAdminUpdateProperty() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      title,
      description,
      location,
      valuation,
      locationLink,
      photos,
      timestamp,
    }: {
      id: bigint;
      title: string;
      description: string;
      location: string;
      valuation: string;
      locationLink: string;
      photos: string[];
      timestamp: bigint;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateProperty(
        id,
        title,
        description,
        location,
        valuation,
        locationLink,
        photos,
        timestamp,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allProperties"] });
      queryClient.invalidateQueries({ queryKey: ["approvedProperties"] });
      queryClient.invalidateQueries({ queryKey: ["myProperties"] });
    },
  });
}
