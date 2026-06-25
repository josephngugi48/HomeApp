// resources/js/pages/locations/index.tsx
import { useState, useCallback } from "react";
import { Head, router, useForm } from "@inertiajs/react";
import { toast } from "sonner";
import PageHeader from "@/components/portal/PageHeader";
import DataTable from "@/components/admin/DataTable";
import StatusBadge from "@/components/portal/StatusBadge";
import FilterBar from "@/components/admin/FilterBar";
import CrudDialog, { FieldSpec } from "@/components/admin/CrudDialog";
import ConfirmDelete from "@/components/admin/ConfirmDelete";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";

interface LocationRow {
  id: number;
  uuid: string;
  name: string;
  code: string;
  status: "Active" | "Inactive";
  apartments_count: number;
  units_count: number;
  can: { update: boolean; delete: boolean };
}

interface PaginatedLocations {
  data: LocationRow[];
  meta: { current_page: number; last_page: number; per_page: number; total: number };
}

interface Filters {
  search?: string;
  status?: string;
  sort_by?: string;
  sort_direction?: "asc" | "desc";
}

interface Props {
  locations: PaginatedLocations;
  filters: Filters;
  can: { create: boolean };
}

const statusOptions = [
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
];

const fields: FieldSpec[] = [
  { name: "name", label: "Name", type: "text", required: true },
  { name: "code", label: "Code", type: "text", required: true },
  { name: "status", label: "Status", type: "select", required: true, options: statusOptions },
];

export default function LocationsIndex({ locations, filters, can }: Props) {
  const [editing, setEditing] = useState<LocationRow | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [delTarget, setDelTarget] = useState<LocationRow | null>(null);

  // useForm gives us Inertia-native processing/errors state instead of
  // hand-rolled fetch logic — matches the conventions used elsewhere
  // (ProfileController, PasswordController) in this codebase.
  const form = useForm<{ name: string; code: string; status: string }>({
    name: "",
    code: "",
    status: "Active",
  });

  const pushQuery = useCallback(
    (next: Partial<Filters & { page?: number }>) => {
      router.get(
        route("locations.index"),
        { ...filters, ...next },
        { preserveState: true, preserveScroll: true, replace: true }
      );
    },
    [filters]
  );

  const debouncedSearch = useDebouncedCallback((value: string) => {
    pushQuery({ search: value, page: 1 });
  }, 350);

  const openCreate = () => {
    setEditing(null);
    form.reset();
    form.clearErrors();
    setDialogOpen(true);
  };

  const openEdit = (row: LocationRow) => {
    setEditing(row);
    form.setData({ name: row.name, code: row.code, status: row.status });
    form.clearErrors();
    setDialogOpen(true);
  };

  const submit = (data: Record<string, any>) => {
    form.setData(data as any);

    const options = {
      onSuccess: () => {
        setDialogOpen(false);
        toast.success(editing ? "Location updated" : "Location created");
      },
      onError: () => {
        toast.error("Please check the form for errors");
      },
    };

    if (editing) {
      form.transform(() => data).put(route("locations.update", editing.id), options);
    } else {
      form.transform(() => data).post(route("locations.store"), options);
    }
  };

  const confirmDelete = () => {
    if (!delTarget) return;
    router.delete(route("locations.destroy", delTarget.id), {
      onSuccess: () => toast.success("Location deleted"),
      onError: () => toast.error("Could not delete this location"),
      onFinish: () => setDelTarget(null),
    });
  };

  return (
    <>
      <Head title="Locations" />
      <div className="mx-auto max-w-7xl">
        <PageHeader
          eyebrow="Masters"
          title="Locations"
          description="Cities and regions where you manage properties."
          actions={
            can.create && (
              <Button className="gap-2" onClick={openCreate}>
                <Plus className="h-4 w-4" /> New Location
              </Button>
            )
          }
        />

        <FilterBar
          search={filters.search}
          onSearch={debouncedSearch}
          searchPlaceholder="Search locations..."
          values={{ status: filters.status ?? "all" }}
          onChange={(_key, value) => pushQuery({ status: value, page: 1 })}
          onClear={() => pushQuery({ search: "", status: "all", page: 1 })}
          selects={[{ key: "status", label: "Status", options: statusOptions }]}
        />

        <DataTable
          data={locations.data}
          serverPagination={{
            page: locations.meta.current_page,
            perPage: locations.meta.per_page,
            total: locations.meta.total,
            onPageChange: (page) => pushQuery({ page }),
          }}
          columns={[
            { header: "Name", cell: (r) => <span className="font-medium">{r.name}</span> },
            {
              header: "Code",
              cell: (r) => <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{r.code}</code>,
            },
            { header: "Apartments", cell: (r) => r.apartments_count },
            { header: "Units", cell: (r) => r.units_count },
            {
              header: "Status",
              cell: (r) => <StatusBadge status={r.status === "Active" ? "Completed" : "Closed"} />,
            },
            {
              header: "",
              className: "text-right",
              cell: (r) => (
                <div className="flex justify-end gap-1">
                  {r.can.update && (
                    <Button variant="ghost" size="icon" onClick={() => openEdit(r)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  {r.can.delete && (
                    <Button variant="ghost" size="icon" onClick={() => setDelTarget(r)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ),
            },
          ]}
        />

        <CrudDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title={editing ? "Edit Location" : "New Location"}
          fields={fields}
          initial={editing ?? undefined}
          onSubmit={submit}
          submitLabel={form.processing ? "Saving..." : "Save"}
        />

        <ConfirmDelete
          open={!!delTarget}
          onOpenChange={(v) => !v && setDelTarget(null)}
          description={`Delete location "${delTarget?.name}"?`}
          onConfirm={confirmDelete}
        />
      </div>
    </>
  );
}