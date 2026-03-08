import Array "mo:core/Array";
import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import UserApproval "user-approval/approval";
import OutCall "http-outcalls/outcall";

import Blob "mo:core/Blob";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";


actor {
  // --- Types ---
  public type UserProfile = {
    name : Text;
  };

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
    photos : [Text];
    status : PropertyStatus;
    createdAt : Int;
    updatedAt : Int;
  };

  module Property {
    public func compareByUpdatedAt(a : Property, b : Property) : Order.Order {
      Int.compare(b.updatedAt, a.updatedAt); // Descending
    };
  };

  // --- State ---
  let accessControlState = AccessControl.initState();
  let approvalState = UserApproval.initState(accessControlState);
  include MixinAuthorization(accessControlState);

  let ADMIN_TOKEN = "takshvi-admin-ku-2024";
  let userProfiles = Map.empty<Principal, UserProfile>();
  let financeRoles = Map.empty<Principal, SmartFinanceRole>();
  let contactSubmissions = List.empty<ContactSubmission>();
  let smartFinanceRequests = List.empty<SmartFinanceRequest>();
  let properties = Map.empty<Nat, Property>();
  var nextPropertyId = 1;

  // Include Storage Mixin
  include MixinStorage();

  // --- User Profile Functions ---
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

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

  public query func getSmartFinanceRequestsWithToken(token : Text) : async [SmartFinanceRequest] {
    if (token != ADMIN_TOKEN) {
      Runtime.trap("Unauthorized: Invalid admin token");
    };
    smartFinanceRequests.toArray().sort();
  };

  public query ({ caller }) func getFinanceRoles() : async [(Principal, SmartFinanceRole)] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    financeRoles.entries().toArray();
  };

  public query func getFinanceRolesWithToken(token : Text) : async [(Principal, SmartFinanceRole)] {
    if (token != ADMIN_TOKEN) {
      Runtime.trap("Unauthorized: Invalid admin token");
    };
    financeRoles.entries().toArray();
  };

  // --- Contact Submission ---
  public shared ({ caller }) func submitContactSubmission(name : Text, email : Text, phone : Text, message : Text) : async () {
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

  public query func getAllContactSubmissionsWithToken(token : Text) : async [ContactSubmission] {
    if (token != ADMIN_TOKEN) {
      Runtime.trap("Unauthorized: Invalid admin token");
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

  public query func listApprovalsWithToken(token : Text) : async [UserApproval.UserApprovalInfo] {
    if (token != ADMIN_TOKEN) {
      Runtime.trap("Unauthorized: Invalid admin token");
    };
    UserApproval.listApprovals(approvalState);
  };

  type SubmitPropertyInput = {
    title : Text;
    description : Text;
    location : Text;
    valuation : Text;
    locationLink : Text;
    photos : [Text];
    timestamp : Int;
  };
  // --- Property Listing ---
  public shared ({ caller }) func submitProperty(
    input : SubmitPropertyInput
  ) : async Nat {
    if (not (UserApproval.isApproved(approvalState, caller) or AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only approved users can submit properties");
    };

    let newProperty : Property = {
      id = nextPropertyId;
      owner = caller;
      title = input.title;
      description = input.description;
      location = input.location;
      valuation = input.valuation;
      locationLink = input.locationLink;
      photos = input.photos;
      status = #pending;
      createdAt = input.timestamp;
      updatedAt = input.timestamp;
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
    photos : [Text],
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
      photos;
      updatedAt = timestamp;
    };

    properties.add(id, updatedProperty);
  };

  public shared ({ caller }) func addPropertyPhoto(id : Nat, photoUrl : Text) : async () {
    let property = getProperty(id);
    if (property.owner != caller and not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only owner or admin can add photos");
    };

    let updatedPhotos = property.photos.concat([photoUrl]);
    let updatedProperty = { property with photos = updatedPhotos };
    properties.add(id, updatedProperty);
  };

  public shared ({ caller }) func removePropertyPhoto(id : Nat, photoUrl : Text) : async () {
    let property = getProperty(id);
    if (property.owner != caller and not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only owner or admin can remove photos");
    };

    let updatedPhotos = property.photos.filter(
      func(p) { not Text.equal(p, photoUrl) }
    );
    let updatedProperty = { property with photos = updatedPhotos };
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
      Runtime.trap("Unauthorized: Only approved users can view their properties");
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

  public query func getAllPropertiesWithToken(token : Text) : async [Property] {
    if (token != ADMIN_TOKEN) {
      Runtime.trap("Unauthorized: Invalid admin token");
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

  // --- Gemini Construction Cost Estimator ---
  func prompt(city : Text, propertyType : Text, cityUpper : Text, propertyTypeUpper : Text, squareFeet : Nat) : Text {
    "You are a top expert in Indian real estate and construction costs, with deep knowledge of current raw material prices in " # city # " and the surrounding region. " # "Provide an extremely accurate, comprehensive construction cost estimation for a " # propertyType # ": " # cityUpper # " | " # propertyTypeUpper # "\n" # "Calculate total cost for " # squareFeet.toText() # " sq. ft., including detailed breakdown of materials and labor costs specific to " # city # ". " # "Do extensive research to ensure all prices are latest and region-specific. Provide cost estimates for standard, premium, and luxury finishes. " # "Return output as ARRAY of JSON objects in the exact format below. " # "Do NOT include any extra text before or after JSON. The output is directly parsed as JSON by code, so NO intro/explanation message:\n" # "Strict output format:\n" # "{" # "\"standard_cost\": 0.0," # "\"premium_cost\": 0.0," # "\"luxury_cost\": 0.0," # "\"materials\": []," # "}" # "NO intro/explanation - output to be parsed directly as JSON.";
  };

  public shared query ({ caller }) func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public shared ({ caller }) func getConstructionEstimate(city : Text, propertyType : Text, squareFeet : Nat, geminiApiKey : Text) : async Text {
    if (not (UserApproval.isApproved(approvalState, caller) or AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only approved users can request construction estimates");
    };

    let promptLower = "Estimate construction cost for " # propertyType # " in " # city # " (" # squareFeet.toText() # " sq. ft.)?";
    let cityUpper = city.toUpper();
    let propertyTypeUpper = propertyType.toUpper();
    let constructedPrompt = prompt(city, propertyType, cityUpper, propertyTypeUpper, squareFeet);

    let jsonPayload = "{" #
    "\\\"contents\\\": [{" #
    "\\\"role\\\": \\\"user\\\"," #
    "\\\"parts\\\": [{" #
    "\\\"text\\\": \\\"" # promptLower # "\\n\\n" #
    constructedPrompt # "\\\"" #
    "]}]}";
    let url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" # geminiApiKey;
    let headers = [];
    await OutCall.httpPostRequest(url, headers, jsonPayload, transform);
  };
};
