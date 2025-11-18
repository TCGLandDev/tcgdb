import { zodResolver } from "@hookform/resolvers/zod";
import { type MutableRefObject, useRef } from "react";
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
import {
	type PokemonSetFormValues,
	pokemonSetFormSchema,
} from "@/domains/pokemon-sets";

type PokemonSetFormProps = {
	defaultValues: PokemonSetFormValues;
	onSubmit: (values: PokemonSetFormValues) => Promise<void> | void;
	isSubmitting?: boolean;
	submitLabel?: string;
};

export function PokemonSetForm({
	defaultValues,
	onSubmit,
	isSubmitting,
	submitLabel = "Save set",
}: PokemonSetFormProps) {
	const form = useForm<PokemonSetFormValues>({
		resolver: zodResolver(pokemonSetFormSchema),
		defaultValues,
	});
	const legalityKeysRef = useRef<string[]>([]);
	const legalityKeyCounter = useRef(0);
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
									<Input placeholder="sv1" {...field} />
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
									<Input placeholder="Scarlet & Violet" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="series"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Series</FormLabel>
								<FormControl>
									<Input placeholder="Scarlet & Violet" {...field} />
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
									<Input placeholder="/pkm/sets/sv1" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="printedTotal"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Printed total</FormLabel>
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
					<FormField
						control={form.control}
						name="releaseDate"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Release date</FormLabel>
								<FormControl>
									<Input type="date" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
				<div className="grid gap-4 md:grid-cols-2">
					<FormField
						control={form.control}
						name="imgSymbol"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Symbol image</FormLabel>
								<FormControl>
									<Input placeholder="https://..." {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="imgLogo"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Logo image</FormLabel>
								<FormControl>
									<Input placeholder="https://..." {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
				<FormField
					control={form.control}
					name="legalities"
					render={({ field }) => {
						const values = field.value ?? [];
						ensureListKeys(
							legalityKeysRef,
							legalityKeyCounter,
							values.length,
							"legal",
						);
						const keys = legalityKeysRef.current;
						return (
							<FormItem className="space-y-2">
								<FormLabel>Legalities</FormLabel>
								<div className="space-y-2">
									{values.map((entry, index) => (
										<div
											key={keys[index] ?? `legal-${index}`}
											className="flex gap-2"
										>
											<FormControl>
												<Input
													placeholder="standard"
													value={entry}
													onChange={(event) => {
														const next = [...values];
														next[index] = event.target.value;
														field.onChange(next);
													}}
												/>
											</FormControl>
											<Button
												type="button"
												variant="ghost"
												onClick={() => {
													legalityKeysRef.current.splice(index, 1);
													field.onChange(values.filter((_, i) => i !== index));
												}}
											>
												Remove
											</Button>
										</div>
									))}
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={() => {
											ensureListKeys(
												legalityKeysRef,
												legalityKeyCounter,
												values.length + 1,
												"legal",
											);
											field.onChange([...values, ""]);
										}}
									>
										Add format
									</Button>
								</div>
								<FormMessage />
							</FormItem>
						);
					}}
				/>
				<div className="flex justify-end">
					<Button type="submit" disabled={isSubmitting}>
						{isSubmitting ? "Saving…" : submitLabel}
					</Button>
				</div>
			</form>
		</Form>
	);
}

function ensureListKeys(
	keysRef: MutableRefObject<string[]>,
	counterRef: MutableRefObject<number>,
	targetLength: number,
	prefix: string,
) {
	while (keysRef.current.length < targetLength) {
		keysRef.current.push(`${prefix}-${counterRef.current++}`);
	}
	if (keysRef.current.length > targetLength) {
		keysRef.current = keysRef.current.slice(0, targetLength);
	}
}
