import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import type { PackageCourier } from "../../pages/package/interface";
import { COURIER_LIST } from "../../config/courierProviders";

const courierSchema = z.object({
  provider: z.enum([
    "steadfast",
    "pathao",
    "redx",
    "carrybee",
    "manual",
    "custom",
    "self",
  ]),
  consignmentId: z.string().optional(),
  trackingCode: z.string().optional(),
  invoice: z.string().optional(),
});

interface CourierFormProps {
  onSubmit: (courier: PackageCourier) => void;
  defaultValues?: Partial<PackageCourier>;
  isLoading?: boolean;
}

export function CourierForm({
  onSubmit,
  defaultValues,
  isLoading,
}: CourierFormProps) {
  const form = useForm<z.infer<typeof courierSchema>>({
    resolver: zodResolver(courierSchema),
    defaultValues: {
      provider: defaultValues?.provider || "steadfast",
      consignmentId: defaultValues?.consignmentId || "",
      trackingCode: defaultValues?.trackingCode || "",
      invoice: defaultValues?.invoice || "",
    },
  });

  const handleSubmit = (values: z.infer<typeof courierSchema>) => {
    onSubmit(values as PackageCourier);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="provider"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Courier Provider</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select courier" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {COURIER_LIST.map((c) => (
                    <SelectItem key={c.slug} value={c.slug}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="consignmentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Consignment ID (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="STD123456" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="trackingCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tracking Code (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="TRK123456" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="invoice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Invoice Number (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="INV-12345" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Submitting..." : "Submit"}
        </Button>
      </form>
    </Form>
  );
}
