
export type Page = 
  | 'Dashboard' 
  | 'Inventory' 
  | 'Sales' 
  | 'Expenses' 
  | 'LHDN' 
  | 'Import' 
  | 'Settings';

export interface InventoryItem {
  id: string;
  date_purchase: string;
  item_name: string;
  qty_received: number;
  unit_price: number;
  shipping_charge: number;
  total_unit_cost: number;
  current_qty: number;
  status: 'Onhand' | 'Sold' | 'Damaged' | 'Returned';
}

export interface Sale {
  id: string;
  inventory_id: string;
  item_name: string;
  sale_date: string;
  selling_price: number;
  cogs: number;
  platform_fee: number;
  selling_earn: number;
  margin_earn: number;
  tracking_num: string;
  username_buyer: string;
  sku_ref_no: string;
  platform: 'Shopee' | 'Lazada' | 'TikTok' | 'Offline' | 'Other';
  status: 'Delivered' | 'Returned' | 'Refunded';
}

export interface Expense {
  id: string;
  date_spent: string;
  category: string;
  description: string;
  amount: number;
  type: 'Operating' | 'Drawing' | 'Capital' | 'Income' | 'Restock';
}

export interface SKUMapping {
  external_sku: string;
  internal_item_name: string;
}

export interface AppData {
  inventory: InventoryItem[];
  sales: Sale[];
  expenses: Expense[];
  skuMappings: SKUMapping[];
}
