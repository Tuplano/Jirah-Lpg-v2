import { Cylinder, Customer, Transaction } from '@/types/inventory';

export const MOCK_CYLINDERS: Cylinder[] = [
  { id: 'CYL-001', brand: 'Petron', size: '11kg', current_status: 'Full', last_updated: '2024-03-20T10:00:00Z' },
  { id: 'CYL-002', brand: 'Solane', size: '11kg', current_status: 'Empty', last_updated: '2024-03-21T08:30:00Z' },
  { id: 'CYL-003', brand: 'M-Gas', size: '5kg', current_status: 'In-Transit', last_updated: '2024-03-22T09:15:00Z' },
  { id: 'CYL-004', brand: 'PryceGas', size: '50kg', current_status: 'Defective', last_updated: '2024-03-18T14:20:00Z' },
  { id: 'CYL-005', brand: 'Phoenix', size: '11kg', current_status: 'Full', last_updated: '2024-03-22T11:00:00Z' },
];

export const MOCK_CUSTOMERS: Customer[] = [
  { id: 'CUST-001', name: 'Aling Nena', contact: '0917-123-4567', address: 'Bgy. San Jose, Pasig' },
  { id: 'CUST-002', name: 'Mang Juan', contact: '0918-765-4321', address: 'Bgy. Kapitolyo, Pasig' },
  { id: 'CUST-003', name: 'Jirah BBQ Grill', contact: '0922-333-2222', address: 'Downtown Center' },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'TXN-001',
    date: '2024-03-22T10:30:00Z',
    customer_id: 'CUST-001',
    items: [
      { brand: 'Petron', size: '11kg', qty: 1, type: 'Full Out' },
      { brand: 'Petron', size: '11kg', qty: 1, type: 'Empty In' }
    ],
    total_amount: 1100,
    status: 'Completed'
  },
  {
    id: 'TXN-002',
    date: '2024-03-22T14:45:00Z',
    customer_id: 'CUST-003',
    items: [
      { brand: 'Solane', size: '11kg', qty: 2, type: 'Full Out' }
    ],
    total_amount: 2300,
    status: 'Pending'
  }
];
