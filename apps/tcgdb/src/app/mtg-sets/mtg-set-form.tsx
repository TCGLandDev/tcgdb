import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { type MtgSetFormValues, mtgSetFormSchema } from "@/domains/mtg-sets";

type MtgSetFormProps = {
	defaultValues: MtgSetFormValues;
	onSubmit: (values: MtgSetFormValues) => Promise<void> | void;
	isSubmitting?: boolean;
	submitLabel?: string;
};

export function MtgSetForm({
	defaultValues,
	onSubmit,
	isSubmitting,
	submitLabel = "Save set",
}: MtgSetFormProps) {
	const form = useForm<MtgSetFormValues>({
		resolver: zodResolver(mtgSetFormSchema),
		defaultValues,
	});

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
				<div className="grid gap-4 md:grid-cols-2">
					<FormField
						control={form.control}
						name="id"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Set ID</FormLabel>
								<FormControl>
									<Input placeholder="woe" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="name"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Name</FormLabel>
								<FormControl>
									<Input placeholder="Wilds of Eldraine" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="path"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Path</FormLabel>
								<FormControl>
									<Input placeholder="/mtg/sets/woe" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="numberCardsInSet"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Number of cards</FormLabel>
								<FormControl>
									<Input
										type="number"
										min={0}
										value={field.value}
										onChange={(event) =>
											field.onChange(
												event.target.value ? Number(event.target.value) : 0,
											)
										}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
				<div className="flex justify-end">
					<Button type="submit" disabled={isSubmitting}>
						{isSubmitting ? "Saving…" : submitLabel}
					</Button>
				</div>
			</form>
		</Form>
	);
}
