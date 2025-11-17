import { zodResolver } from "@hookform/resolvers/zod";
import { type MutableRefObject, useEffect, useRef } from "react";
import { useFieldArray, useForm } from "react-hook-form";

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
import { Textarea } from "@/components/ui/textarea";
import {
	type PokemonSingleFormValues,
	pokemonSingleFormSchema,
} from "@/domains/pokemon-singles";

type PokemonSingleFormProps = {
	defaultValues: PokemonSingleFormValues;
	onSubmit: (values: PokemonSingleFormValues) => Promise<void> | void;
	isSubmitting?: boolean;
	submitLabel?: string;
};

export function PokemonSingleForm({
	defaultValues,
	onSubmit,
	isSubmitting,
	submitLabel = "Save card",
}: PokemonSingleFormProps) {
	const form = useForm<PokemonSingleFormValues>({
		resolver: zodResolver(pokemonSingleFormSchema),
		defaultValues,
	});
	const typeKeysRef = useRef<string[]>([]);
	const typeKeyCounter = useRef(0);
	const subtypeKeysRef = useRef<string[]>([]);
	const subtypeKeyCounter = useRef(0);
	const tcgKeysRef = useRef<string[]>([]);
	const tcgKeyCounter = useRef(0);
	const {
		fields: legalityFields,
		append: appendLegality,
		remove: removeLegality,
	} = useFieldArray<PokemonSingleFormValues, "legalities">({
		control: form.control,
		name: "legalities",
	});

	useEffect(() => {
		if (legalityFields.length === 0) {
			appendLegality({ format: "", status: "" });
		}
	}, [appendLegality, legalityFields.length]);

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
				<div className="grid gap-4 md:grid-cols-2">
					<FormField
						control={form.control}
						name="tcgLandPublicId"
						render={({ field }) => (
							<FormItem>
								<FormLabel>TCG.Land Public ID</FormLabel>
								<FormControl>
									<Input placeholder="pkm-sv1-001" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="oracleId"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Oracle ID</FormLabel>
								<FormControl>
									<Input placeholder="oracle-..." {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="sId"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Set ID (sId)</FormLabel>
								<FormControl>
									<Input placeholder="sv1" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="cId"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Card ID (cId)</FormLabel>
								<FormControl>
									<Input placeholder="001" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="lang"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Language</FormLabel>
								<FormControl>
									<Input placeholder="en" {...field} />
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
									<Input placeholder="/pkm/sv1/cards/001" {...field} />
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
									<Input placeholder="Pikachu" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="number"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Collector number</FormLabel>
								<FormControl>
									<Input placeholder="001/198" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="supertype"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Supertype</FormLabel>
								<FormControl>
									<Input placeholder="Pokémon" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="rarity"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Rarity</FormLabel>
								<FormControl>
									<Input placeholder="Rare" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
				<FormField
					control={form.control}
					name="types"
					render={({ field }) => {
						const values = field.value ?? [];
						ensureListKeys(typeKeysRef, typeKeyCounter, values.length, "type");
						const keys = typeKeysRef.current;
						return (
							<FormItem className="space-y-2">
								<FormLabel>Types</FormLabel>
								<p className="text-sm text-muted-foreground">
									Add the printed types for the card.
								</p>
								<div className="space-y-2">
									{values.map((entry, index) => (
										<div
											key={keys[index] ?? `type-${index}`}
											className="flex gap-2"
										>
											<FormControl>
												<Input
													placeholder="Electric"
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
													typeKeysRef.current.splice(index, 1);
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
												typeKeysRef,
												typeKeyCounter,
												values.length + 1,
												"type",
											);
											field.onChange([...values, ""]);
										}}
									>
										Add type
									</Button>
								</div>
								<FormMessage />
							</FormItem>
						);
					}}
				/>
				<FormField
					control={form.control}
					name="subtypes"
					render={({ field }) => {
						const values = field.value ?? [];
						ensureListKeys(
							subtypeKeysRef,
							subtypeKeyCounter,
							values.length,
							"subtype",
						);
						const keys = subtypeKeysRef.current;
						return (
							<FormItem className="space-y-2">
								<FormLabel>Subtypes</FormLabel>
								<p className="text-sm text-muted-foreground">
									Optional card subtypes.
								</p>
								<div className="space-y-2">
									{values.map((entry, index) => (
										<div
											key={keys[index] ?? `subtype-${index}`}
											className="flex gap-2"
										>
											<FormControl>
												<Input
													placeholder="EX"
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
													subtypeKeysRef.current.splice(index, 1);
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
												subtypeKeysRef,
												subtypeKeyCounter,
												values.length + 1,
												"subtype",
											);
											field.onChange([...values, ""]);
										}}
									>
										Add subtype
									</Button>
								</div>
								<FormMessage />
							</FormItem>
						);
					}}
				/>
				<FormField
					control={form.control}
					name="tcgPlayerIds"
					render={({ field }) => {
						const values = field.value ?? [0];
						ensureListKeys(tcgKeysRef, tcgKeyCounter, values.length, "tcg");
						const keys = tcgKeysRef.current;
						return (
							<FormItem className="space-y-2">
								<FormLabel>TCGplayer IDs</FormLabel>
								<p className="text-sm text-muted-foreground">
									Enter numeric IDs for each finish.
								</p>
								<div className="space-y-2">
									{values.map((entry, index) => (
										<div
											key={keys[index] ?? `tcg-${index}`}
											className="flex gap-2"
										>
											<FormControl>
												<Input
													type="number"
													min={0}
													value={entry}
													onChange={(event) => {
														const next = [...values];
														next[index] = event.target.value
															? Number(event.target.value)
															: 0;
														field.onChange(next);
													}}
												/>
											</FormControl>
											<Button
												type="button"
												variant="ghost"
												disabled={values.length === 1}
												onClick={() => {
													if (values.length === 1) {
														return;
													}
													tcgKeysRef.current.splice(index, 1);
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
												tcgKeysRef,
												tcgKeyCounter,
												values.length + 1,
												"tcg",
											);
											field.onChange([...values, 0]);
										}}
									>
										Add ID
									</Button>
								</div>
								<FormMessage />
							</FormItem>
						);
					}}
				/>
				<div className="grid gap-4 md:grid-cols-2">
					<FormField
						control={form.control}
						name="images.small"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Small image</FormLabel>
								<FormControl>
									<Input placeholder="https://..." {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="images.large"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Large image</FormLabel>
								<FormControl>
									<Input placeholder="https://..." {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
				<div className="space-y-4">
					<div>
						<FormLabel>Legalities</FormLabel>
						<p className="text-sm text-muted-foreground">
							Map of format → status that we convert into the schema object.
						</p>
					</div>
					<div className="flex flex-col gap-4">
						{legalityFields.map((field, index) => (
							<div key={field.id} className="flex flex-col gap-2 md:flex-row">
								<FormField
									control={form.control}
									name={`legalities.${index}.format`}
									render={({ field }) => (
										<FormItem className="flex-1">
											<FormControl>
												<Input placeholder="standard" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name={`legalities.${index}.status`}
									render={({ field }) => (
										<FormItem className="flex-1">
											<FormControl>
												<Input placeholder="legal" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<Button
									type="button"
									variant="ghost"
									onClick={() => removeLegality(index)}
								>
									Remove
								</Button>
							</div>
						))}
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => appendLegality({ format: "", status: "" })}
						>
							Add legality
						</Button>
					</div>
				</div>
				<div>
					<FormLabel>Notes</FormLabel>
					<Textarea
						disabled
						value="Additional payload fields can be added once the schema expands."
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
