"use client";

import { ActionIcon, Group, Table } from "@mantine/core";
import { Pencil, Trash } from "lucide-react";

import type { Vendor } from "@/store/vendors";
import { formatPhone } from "@/lib/phone";

type VendorTableProps = {
  vendors: Vendor[];
  onEdit: (vendor: Vendor) => void;
  onDelete: (vendor: Vendor) => void;
};

export function VendorTable({ vendors, onEdit, onDelete }: VendorTableProps) {
  return (
    <div className="hidden sm:block">
      <Table striped highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Phone</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {vendors.map((vendor) => (
            <Table.Tr key={vendor.id}>
              <Table.Td>{vendor.name}</Table.Td>
              <Table.Td>{vendor.phone ? formatPhone(vendor.phone) : "—"}</Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <ActionIcon
                    variant="subtle"
                    aria-label={`Edit ${vendor.name}`}
                    onClick={() => onEdit(vendor)}
                  >
                    <Pencil size={16} />
                  </ActionIcon>
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    aria-label={`Delete ${vendor.name}`}
                    onClick={() => onDelete(vendor)}
                  >
                    <Trash size={16} />
                  </ActionIcon>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </div>
  );
}
