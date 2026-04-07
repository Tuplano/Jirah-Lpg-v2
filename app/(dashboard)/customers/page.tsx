import { CustomersView } from "@/components/customers/customers-view";
import { getAllCustomers, getAllCustomerLpgPrices } from "@/services/customer-service";
import { getAllLpgSizes } from "@/services/lpg-size-service";

export default async function CustomersPage() {
  const [customers, lpgSizes, customerPrices] = await Promise.all([
    getAllCustomers(),
    getAllLpgSizes(),
    getAllCustomerLpgPrices(),
  ]);

  return (
    <CustomersView
      initialCustomers={customers}
      lpgSizes={lpgSizes}
      initialCustomerPrices={customerPrices}
    />
  );
}
