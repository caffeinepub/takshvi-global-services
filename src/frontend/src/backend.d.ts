import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface ContactSubmission {
    name: string;
    email: string;
    message: string;
    phone: string;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
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
    photos: Array<string>;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface SmartFinanceRequest {
    request: string;
    user: Principal;
    timestamp: bigint;
}
export interface SubmitPropertyInput {
    title: string;
    description: string;
    valuation: string;
    timestamp: bigint;
    locationLink: string;
    location: string;
    photos: Array<string>;
}
export interface UserProfile {
    name: string;
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
    addPropertyPhoto(id: bigint, photoUrl: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getAllContactSubmissions(): Promise<Array<ContactSubmission>>;
    getAllContactSubmissionsWithToken(token: string): Promise<Array<ContactSubmission>>;
    getAllProperties(): Promise<Array<Property>>;
    getAllPropertiesWithToken(token: string): Promise<Array<Property>>;
    getApprovedProperties(): Promise<Array<Property>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getConstructionEstimate(city: string, propertyType: string, squareFeet: bigint, geminiApiKey: string): Promise<string>;
    getFinanceRoles(): Promise<Array<[Principal, SmartFinanceRole]>>;
    getFinanceRolesWithToken(token: string): Promise<Array<[Principal, SmartFinanceRole]>>;
    getMyProperties(): Promise<Array<Property>>;
    getSmartFinanceRequests(): Promise<Array<SmartFinanceRequest>>;
    getSmartFinanceRequestsWithToken(token: string): Promise<Array<SmartFinanceRequest>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isCallerApproved(): Promise<boolean>;
    isCallerFinanceApproved(): Promise<boolean>;
    listApprovals(): Promise<Array<UserApprovalInfo>>;
    listApprovalsWithToken(token: string): Promise<Array<UserApprovalInfo>>;
    removePropertyPhoto(id: bigint, photoUrl: string): Promise<void>;
    requestApproval(): Promise<void>;
    requestSmartFinanceAccess(request: string, timestamp: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setApproval(user: Principal, status: ApprovalStatus): Promise<void>;
    setPropertyStatus(id: bigint, status: PropertyStatus, _timestamp: bigint): Promise<void>;
    setSmartFinanceRole(user: Principal, role: SmartFinanceRole): Promise<void>;
    submitContactSubmission(name: string, email: string, phone: string, message: string): Promise<void>;
    submitProperty(input: SubmitPropertyInput): Promise<bigint>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateProperty(id: bigint, title: string, description: string, location: string, valuation: string, locationLink: string, photos: Array<string>, timestamp: bigint): Promise<void>;
}
