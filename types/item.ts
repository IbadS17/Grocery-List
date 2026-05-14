export interface Item {
  id: string;

  name: string;

  quantity?: string;

  unit?: string;

  status: "PENDING" | "BOUGHT" | "OUT_OF_STOCK";

  alternative?: string;

  addedBy?: string;

  updatedBy?: string;

  archived?: boolean;

  createdAt?: any;
}
