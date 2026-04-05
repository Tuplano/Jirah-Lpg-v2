import { CustomersView } from "@/components/customers/customers-view";
import { getAllCustomers } from "@/services/customer-service";

export default async function CustomersPage() {
  const customers = await getAllCustomers();
  
  return <CustomersView initialCustomers={customers} />;
}

