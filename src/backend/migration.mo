import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";

module {
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

  public type OldActor = {
    financeRoles : Map.Map<Principal, SmartFinanceRole>;
    contactSubmissions : List.List<ContactSubmission>;
    smartFinanceRequests : List.List<SmartFinanceRequest>;
  };

  public type Property = {
    id : Nat;
    owner : Principal;
    title : Text;
    description : Text;
    location : Text;
    valuation : Text;
    locationLink : Text;
    status : { #pending; #approved; #rejected };
    createdAt : Int;
    updatedAt : Int;
  };

  public type NewActor = {
    financeRoles : Map.Map<Principal, SmartFinanceRole>;
    contactSubmissions : List.List<ContactSubmission>;
    smartFinanceRequests : List.List<SmartFinanceRequest>;
    nextPropertyId : Nat;
    properties : Map.Map<Nat, Property>;
  };

  public func run(old : OldActor) : NewActor {
    {
      old with
      nextPropertyId = 1;
      properties = Map.empty<Nat, Property>();
    };
  };
};
