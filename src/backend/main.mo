import Array "mo:core/Array";
import Map "mo:core/Map";
import List "mo:core/List";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import UserApproval "user-approval/approval";
import Migration "migration";

(with migration = Migration.run)
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

  public type PropertyStatus = {
    #pending;
    #approved;
    #rejected;
  };

  public type Property = {
    id : Nat;
    owner : Principal;
    title : Text;
    description : Text;
    location : Text;
    valuation : Text;
    locationLink : Text;
    status : PropertyStatus;
    createdAt : Int;
    updatedAt : Int;
  };

  module Property {
    public func compareByUpdatedAt(a : Property, b : Property) : Order.Order {
      Int.compare(b.updatedAt, a.updatedAt); // Descending
    };
  };

  var nextPropertyId = 1;

  let financeRoles = Map.empty<Principal, SmartFinanceRole>();
  let contactSubmissions = List.empty<ContactSubmission>();
  let smartFinanceRequests = List.empty<SmartFinanceRequest>();
  let properties = Map.empty<Nat, Property>();

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

  // --- Property Listing ---
  public shared ({ caller }) func submitProperty(
    title : Text,
    description : Text,
    location : Text,
    valuation : Text,
    locationLink : Text,
    timestamp : Int,
  ) : async Nat {
    if (not (UserApproval.isApproved(approvalState, caller) or AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only approved users can submit properties");
    };

    let newProperty : Property = {
      id = nextPropertyId;
      owner = caller;
      title;
      description;
      location;
      valuation;
      locationLink;
      status = #pending;
      createdAt = timestamp;
      updatedAt = timestamp;
    };

    properties.add(nextPropertyId, newProperty);
    nextPropertyId += 1;
    newProperty.id;
  };

  public shared ({ caller }) func updateProperty(
    id : Nat,
    title : Text,
    description : Text,
    location : Text,
    valuation : Text,
    locationLink : Text,
    timestamp : Int,
  ) : async () {
    let property = getProperty(id);
    if (property.owner != caller and not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only owner or admin can update this property");
    };

    let updatedProperty : Property = {
      property with
      title;
      description;
      location;
      valuation;
      locationLink;
      updatedAt = timestamp;
    };

    properties.add(id, updatedProperty);
  };

  public shared ({ caller }) func setPropertyStatus(id : Nat, status : PropertyStatus, _timestamp : Int) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can change property status");
    };
    let property = getProperty(id);
    let updatedProperty = { property with status };
    properties.add(id, updatedProperty);
  };

  public query ({ caller }) func getApprovedProperties() : async [Property] {
    let approved = properties.values().toArray().filter(
      func(p) {
        switch (p.status) {
          case (#approved) { true };
          case (_) { false };
        };
      }
    );
    approved.sort<Property>(
      Property.compareByUpdatedAt
    );
  };

  public query ({ caller }) func getMyProperties() : async [Property] {
    if (not (UserApproval.isApproved(approvalState, caller) or AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only property owner or admin can use this function");
    };
    properties.values().toArray().filter(
      func(p) { p.owner == caller }
    ).sort<Property>(
        Property.compareByUpdatedAt
      );
  };

  public query ({ caller }) func getAllProperties() : async [Property] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can use this function");
    };
    properties.values().toArray().sort<Property>(
      Property.compareByUpdatedAt
    );
  };

  func getProperty(id : Nat) : Property {
    switch (properties.get(id)) {
      case (?p) { p };
      case (null) { Runtime.trap("Property with id " # id.toText() # " not found") };
    };
  };
};
