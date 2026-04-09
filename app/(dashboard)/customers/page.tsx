import { CustomersView } from "@/components/customers/customers-view";
import { getAllCustomers, getAllCustomerLpgPrices } from "@/services/customer-service";
import { getAllLpgSizes } from "@/services/lpg-size-service";

export default async function CustomersPage() {
  const [customersResponse, lpgSizes, customerPrices] = await Promise.all([
    getAllCustomers(1, 10),
    getAllLpgSizes(),
    getAllCustomerLpgPrices(),
  ]);

  return (
    <CustomersView
      initialCustomers={customersResponse.data}
      initialCount={customersResponse.count}
      lpgSizes={lpgSizes}
      initialCustomerPrices={customerPrices}
    />
  );
}
