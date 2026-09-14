"use client";

import { useState } from "react";
import { Button, Group, Modal, Stack, Text, Title } from "@mantine/core";
import { Plus } from "lucide-react";

import { VendorCards } from "./VendorCards";
import { VendorFormModal } from "./VendorFormModal";
import { VendorTable } from "./VendorTable";
import { useVendorsStore, type Vendor } from "@/store/vendors";

export function VendorsManager() {
  const vendors = useVendorsStore((state) => state.vendors);
  const deleteVendor = useVendorsStore((state) => state.deleteVendor);
  const [formOpened, setFormOpened] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [deletingVendor, setDeletingVendor] = useState<Vendor | null>(null);

  return (
    <>
      <Group justify="space-between" mb="md">
        <Title order={1}>Vendors</Title>
        <Button
          leftSection={<Plus size={18} />}
          onClick={() => {
            setEditingVendor(null);
            setFormOpened(true);
          }}
        >
          Add Vendor
        </Button>
      </Group>

      {vendors.length === 0 ? (
        <Text c="dimmed">No vendors yet. Add one to get started.</Text>
      ) : (
        <>
          <VendorTable
            vendors={vendors}
            onEdit={(vendor) => {
              setEditingVendor(vendor);
              setFormOpened(true);
            }}
            onDelete={setDeletingVendor}
          />
          <VendorCards
            vendors={vendors}
            onEdit={(vendor) => {
              setEditingVendor(vendor);
              setFormOpened(true);
            }}
            onDelete={setDeletingVendor}
          />
        </>
      )}

      <VendorFormModal opened={formOpened} vendor={editingVendor} onClose={() => setFormOpened(false)} />

      <Modal
        opened={deletingVendor !== null}
        onClose={() => setDeletingVendor(null)}
        title="Delete vendor"
        centered
      >
        <Stack gap="md">
          <Text>Are you sure you want to delete &quot;{deletingVendor?.name}&quot;?</Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setDeletingVendor(null)}>
              Cancel
            </Button>
            <Button
              color="red"
              onClick={() => {
                if (deletingVendor) deleteVendor(deletingVendor.id);
                setDeletingVendor(null);
              }}
            >
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
