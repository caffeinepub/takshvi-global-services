import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserApprovalInfo {
    status: ApprovalStatus;
    principal: Principal;
}
export interface Property {
    id: bigint;
    status: PropertyStatus;
    title: string;
    owner: Principal;
    createdAt: bigint;
    description: string;
    valuation: string;
    updatedAt: bigint;
    locationLink: string;
    location: string;
}
export interface ContactSubmission {
    name: string;
    email: string;
    message: string;
    phone: string;
}
export interface SmartFinanceRequest {
    request: string;
    user: Principal;
    timestamp: bigint;
}
export enum PropertyStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum SmartFinanceRole {
    financeApproved = "financeApproved",
    standard = "standard"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getAllContactSubmissions(): Promise<Array<ContactSubmission>>;
    getAllProperties(): Promise<Array<Property>>;
    getApprovedProperties(): Promise<Array<Property>>;
    getCallerUserRole(): Promise<UserRole>;
    getFinanceRoles(): Promise<Array<[Principal, SmartFinanceRole]>>;
    getMyProperties(): Promise<Array<Property>>;
    getSmartFinanceRequests(): Promise<Array<SmartFinanceRequest>>;
    isCallerAdmin(): Promise<boolean>;
    isCallerApproved(): Promise<boolean>;
    isCallerFinanceApproved(): Promise<boolean>;
    listApprovals(): Promise<Array<UserApprovalInfo>>;
    requestApproval(): Promise<void>;
    requestSmartFinanceAccess(request: string, timestamp: bigint): Promise<void>;
    setApproval(user: Principal, status: ApprovalStatus): Promise<void>;
    setPropertyStatus(id: bigint, status: PropertyStatus, _timestamp: bigint): Promise<void>;
    setSmartFinanceRole(user: Principal, role: SmartFinanceRole): Promise<void>;
    submitContactSubmission(name: string, email: string, phone: string, message: string): Promise<void>;
    submitProperty(title: string, description: string, location: string, valuation: string, locationLink: string, timestamp: bigint): Promise<bigint>;
    updateProperty(id: bigint, title: string, description: string, location: string, valuation: string, locationLink: string, timestamp: bigint): Promise<void>;
}
