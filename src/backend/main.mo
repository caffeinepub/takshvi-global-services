import Array "mo:core/Array";
import Map "mo:core/Map";
import List "mo:core/List";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import UserApproval "user-approval/approval";

actor {
  // Initialize Access Control for role-based access
  let accessControlState = AccessControl.initState();
  let approvalState = UserApproval.initState(accessControlState);
  include MixinAuthorization(accessControlState);

  public type SmartFinanceRole = {
    #standard;
    #financeApproved;
  };

  public type ContactSubmission = {
    name : Text;
    email : Text;
    phone : Text;
    message : Text;
  };

  public type SmartFinanceRequest = {
    user : Principal;
    request : Text;
    timestamp : Int;
  };

  module SmartFinanceRequest {
    public func compare(a : SmartFinanceRequest, b : SmartFinanceRequest) : Order.Order {
      Int.compare(a.timestamp, b.timestamp);
    };
  };

  let financeRoles = Map.empty<Principal, SmartFinanceRole>();
  let contactSubmissions = List.empty<ContactSubmission>();
  let smartFinanceRequests = List.empty<SmartFinanceRequest>();

  // --- Smart Finance Approval ---
  public shared ({ caller }) func requestSmartFinanceAccess(request : Text, timestamp : Int) : async () {
    if (not (UserApproval.isApproved(approvalState, caller) or AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only approved users can perform this action");
    };
    if (request.size() > 1000) {
      Runtime.trap("Request is too big (max. 1000 bytes)");
    };

    let financeRequest = {
      user = caller;
      request;
      timestamp;
    };
    smartFinanceRequests.add(financeRequest);
  };

  public shared ({ caller }) func setSmartFinanceRole(user : Principal, role : SmartFinanceRole) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    financeRoles.add(user, role);
  };

  public query ({ caller }) func isCallerFinanceApproved() : async Bool {
    if (not (UserApproval.isApproved(approvalState, caller) or AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only approved users can perform this action");
    };
    switch (financeRoles.get(caller)) {
      case (?#financeApproved) { true };
      case (_) { false };
    };
  };

  public query ({ caller }) func getSmartFinanceRequests() : async [SmartFinanceRequest] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    smartFinanceRequests.toArray().sort();
  };

  public query ({ caller }) func getFinanceRoles() : async [(Principal, SmartFinanceRole)] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    financeRoles.entries().toArray();
  };

  // --- Contact Submission ---
  public shared ({ caller }) func submitContactSubmission(name : Text, email : Text, phone : Text, message : Text) : async () {
    // Validate message only length (max 2000 bytes)
    if (message.size() > 2000) {
      Runtime.trap("Message is too big (max. 2000 bytes)");
    };
    let submission = {
      name;
      email;
      phone;
      message;
    };
    contactSubmissions.add(submission);
  };

  public query ({ caller }) func getAllContactSubmissions() : async [ContactSubmission] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    contactSubmissions.toArray();
  };

  // --- User Approval ---
  public query ({ caller }) func isCallerApproved() : async Bool {
    AccessControl.hasPermission(accessControlState, caller, #admin) or UserApproval.isApproved(approvalState, caller);
  };

  public shared ({ caller }) func requestApproval() : async () {
    UserApproval.requestApproval(approvalState, caller);
  };

  public shared ({ caller }) func setApproval(user : Principal, status : UserApproval.ApprovalStatus) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.setApproval(approvalState, user, status);
  };

  public query ({ caller }) func listApprovals() : async [UserApproval.UserApprovalInfo] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.listApprovals(approvalState);
  };
};
