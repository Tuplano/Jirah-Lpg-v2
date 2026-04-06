export default async function CustomersPage() {
  return (
    <div className="space-y-3 p-6">
      <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
      <p className="text-muted-foreground">
        The current database schema does not include a <code>customers</code> table, so this module is disabled.
      </p>
    </div>
  );
}
