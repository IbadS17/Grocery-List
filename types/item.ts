export interface Item {
  id: string;

  name: string;

  status:
    | "PENDING"
    | "BOUGHT"
    | "OUT_OF_STOCK";

  alternative?: string;

  createdAt?: any;
}