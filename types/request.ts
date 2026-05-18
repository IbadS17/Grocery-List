export interface RequestItem {
  id: string;

  itemName: string;

  requestedBy: string;

  status: "PENDING" | "ACCEPTED" | "REJECTED";

  createdAt?: any;
}
