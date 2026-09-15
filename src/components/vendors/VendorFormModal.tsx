"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Group, Modal, Stack, TextInput } from "@mantine/core";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect } from "react";

import {
  useVendorsStore,
  type Vendor,
  type VendorInput,
} from "@/store/vendors";
import { validatePhone, formatPhone } from "@/lib/phone";

const vendorSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  phone: z.string().trim().refine(
    (val) => val === "" || validatePhone(val),
    "Enter a valid 10-digit Indian mobile number"
  ),
});

type VendorFormValues = z.infer<typeof vendorSchema>;

type VendorFormModalProps = {
  opened: boolean;
  vendor: Vendor | null;
  onClose: () => void;
};

export function VendorFormModal({ opened, vendor, onClose }: VendorFormModalProps) {
  const addVendor = useVendorsStore((state) => state.addVendor);
  const updateVendor = useVendorsStore((state) => state.updateVendor);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VendorFormValues>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      name: "",
      phone: "",
    },
  });

  useEffect(() => {
    if (!opened) return;
    reset({
      name: vendor?.name ?? "",
      phone: vendor?.phone ?? "",
    });
  }, [opened, vendor, reset]);

  const onSubmit = (values: VendorFormValues) => {
    const input: VendorInput = { ...values, phone: formatPhone(values.phone) };
    if (vendor) {
      updateVendor(vendor.id, input);
    } else {
      addVendor(input);
    }
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={vendor ? "Edit Vendor" : "Add Vendor"}
      centered
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Name"
            placeholder="e.g. Shanmuga Stores"
            withAsterisk
            {...register("name")}
            error={errors.name?.message}
          />
          <TextInput
            label="Phone"
            placeholder="e.g. 9876543210"
            {...register("phone")}
            error={errors.phone?.message}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{vendor ? "Save" : "Add"}</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
