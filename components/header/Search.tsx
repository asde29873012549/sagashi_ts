import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/base/dialog";
import { Input as SearchInput } from "../base/input";
import { Separator } from "@/components/base/separator";
import { useState, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/router";

import DOMPurify from "dompurify";

import { debounce, cn } from "@/lib/utility/utils";
import type { ApiResponse } from "@/lib/types/global";

interface SearchResult {
	designers: string[];
	popular: string[];
}

export default function Search({ children }: { children: React.ReactNode }) {
	const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
	const [search, setSearch] = useState<string>("");
	const [guideKeyword, setGuideKeyword] = useState<SearchResult>({ designers: [], popular: [] });
	const escape = useRef<string>("");
	const router = useRouter();
	const localRecentSearch = useRef<string>();

	if (typeof localStorage !== "undefined") {
		localRecentSearch.current = localStorage.getItem("Recently Search") || "";
	}

	escape.current = search;

	const fetcher = async (keyword: string) => {
		try {
			const searchResponse = await fetch(`/api/proxy/search/guideKeyword?keyword=${keyword}`);
			const searchResult: ApiResponse<{ designers: string[]; popular: string[] }> =
				await searchResponse?.json();
			if (!searchResult) return;
			if (typeof searchResult.data === "string") throw new Error(searchResult.data);
			setGuideKeyword(searchResult.data);
		} catch (error) {
			console.log(error);
		}
	};

	const fetchSearchResult = useCallback(() => fetcher(escape.current), []);

	const debouncedSearch = useMemo(() => debounce(fetchSearchResult, 250), [fetchSearchResult]);

	const onEnterInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearch(e.target.value);
		debouncedSearch();
	};

	const safeParse = (json: string) => {
		try {
			return JSON.parse(json);
		} catch (e) {
			return "";
		}
	};

	const onEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			e.preventDefault();
			setIsSearchOpen(false);
			const originStore = safeParse(localStorage.getItem("Recently Search") || "");
			localStorage.setItem(
				"Recently Search",
				JSON.stringify([search, ...(originStore?.slice(0, 6) ?? [])]),
			);
			router.push(`/shop/search?keyword=${search}`);
			setSearch("");
			setGuideKeyword({ designers: [], popular: [] });
		}
	};

	const onClickGuideKeyword = (e: React.MouseEvent<HTMLDivElement>) => {
		const keyword = (e.target as HTMLDivElement).textContent;
		setIsSearchOpen(false);
		const originStore = safeParse(localStorage.getItem("Recently Search") || "");
		localStorage.setItem(
			"Recently Search",
			JSON.stringify([keyword, ...(originStore?.slice(0, 6) ?? [])]),
		);
		router.push(`/shop/search?keyword=${keyword}`);
		setSearch("");
		setGuideKeyword({ designers: [], popular: [] });
	};

	const designerGuideKeyword = guideKeyword?.designers ?? [];
	const popularGuideKeyword = guideKeyword?.popular ?? [];

	return (
		<Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
			<DialogTrigger className="outline-transparent">
				<div className="flex">{children}</div>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						<div className="md:flex md:h-12 md:w-full md:items-center md:justify-end">
							<SearchInput
								placeholder="Search"
								className="h-[45px] w-10/12 font-normal placeholder:text-info md:h-10 md:w-full"
								style={{ border: "none" }}
								value={search}
								onChange={onEnterInput}
								onKeyDown={onEnter}
							></SearchInput>
						</div>
					</DialogTitle>
					{(guideKeyword || localRecentSearch.current) && (
						<>
							<Separator className="!mt-0" />
							<DropDown
								className={
									designerGuideKeyword.length === 0 && popularGuideKeyword.length === 0
										? "!pb-0"
										: ""
								}
							>
								{popularGuideKeyword.length === 0 &&
									designerGuideKeyword.length === 0 &&
									localRecentSearch.current && (
										<DropDownGroup title="Recently Search">
											{safeParse(localRecentSearch.current).map(
												(keyword: string, index: number) => {
													return (
														<DropDownItem
															key={`${keyword}-${index}-recent`}
															onClick={onClickGuideKeyword}
														>
															{keyword}
														</DropDownItem>
													);
												},
											)}
										</DropDownGroup>
									)}
								{designerGuideKeyword.length > 0 && (
									<DropDownGroup title="Brands">
										{designerGuideKeyword.map((keyword, index) => {
											return (
												<DropDownItem
													key={`${keyword}-${index}-desginer`}
													onClick={onClickGuideKeyword}
												>
													<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(keyword) }} />
												</DropDownItem>
											);
										})}
									</DropDownGroup>
								)}
								{popularGuideKeyword.length > 0 && (
									<>
										<Separator className="!mt-0" />
										<DropDownGroup title="Popular Searches">
											{popularGuideKeyword.map((keyword, index) => {
												return (
													<DropDownItem
														key={`${keyword}-${index}-popular`}
														onClick={onClickGuideKeyword}
													>
														<div
															dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(keyword) }}
														/>
													</DropDownItem>
												);
											})}
										</DropDownGroup>
									</>
								)}
							</DropDown>
						</>
					)}
				</DialogHeader>
			</DialogContent>
		</Dialog>
	);
}

function DropDownItem({
	children,
	onClick,
}: {
	children: React.ReactNode;
	onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
}) {
	return (
		<div
			className="flex items-center rounded px-1 py-1 font-light hover:cursor-pointer hover:bg-slate-100"
			onClick={onClick}
		>
			<div className="text-base text-slate-600">{children}</div>
		</div>
	);
}

function DropDownGroup({ children, title }: { children: React.ReactNode; title: string }) {
	return (
		<div>
			<div className="px-1 py-2 text-sm text-slate-400">{title}</div>
			<div>{children}</div>
		</div>
	);
}

function DropDown({ children, className = "" }: { children: React.ReactNode; className?: string }) {
	return <div className={cn("!mt-0 px-2 pb-1", className)}>{children}</div>;
}
