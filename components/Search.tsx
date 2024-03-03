import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input as SearchInput } from "./ui/input";
import { DropDown, DropDownGroup, DropDownItem } from "@/components/SearchDropDownList";
import { Separator } from "@/components/ui/separator";
import { useState, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/router";

import * as DOMPurify from "dompurify";

import debounce from "@/lib/utils/utils";

interface SearchResult {
	data: {
		designers: string[];
		popular: string[];
	};
}

export default function Search({ children }: { children: React.ReactNode }) {
	const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
	const [search, setSearch] = useState<string>("");
	const [guideKeyword, setGuideKeyword] = useState<SearchResult>();
	const escape = useRef<string>();
	const router = useRouter();
	const localRecentSearch = useRef<string>();

	if (typeof localStorage !== "undefined") {
		localRecentSearch.current = localStorage.getItem("Recently Search") || "";
	}

	escape.current = search;

	const fetcher = async (keyword: string) => {
		try {
			const searchResponse = await fetch(`/api/proxy/search/guideKeyword?keyword=${keyword}`);
			const searchResult = await searchResponse?.json();
			setGuideKeyword(searchResult);
		} catch (error) {
			console.log(error);
		}
	};

	const fetchSearchResult = useCallback(() => fetcher(escape.current as string), []);

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
			setGuideKeyword(undefined);
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
		setGuideKeyword(undefined);
	};

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
					{(guideKeyword?.data || localRecentSearch.current) && (
						<>
							<Separator className="!mt-0" />
							<DropDown
								className={
									guideKeyword?.data?.popular.length === 0 &&
									guideKeyword.data.designers.length === 0
										? "!pb-0"
										: ""
								}
							>
								{!guideKeyword?.data && localRecentSearch.current && (
									<DropDownGroup title="Recently Search">
										{safeParse(localRecentSearch.current).map((keyword: string, index: number) => {
											return (
												<DropDownItem
													key={`${keyword}-${index}-recent`}
													onClick={onClickGuideKeyword}
												>
													{keyword}
												</DropDownItem>
											);
										})}
									</DropDownGroup>
								)}
								{guideKeyword?.data?.designers && guideKeyword.data.designers.length > 0 && (
									<DropDownGroup title="Brands">
										{guideKeyword?.data.designers.map((keyword, index) => {
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
								{guideKeyword?.data?.designers && guideKeyword.data.designers.length > 0 && (
									<>
										<Separator className="!mt-0" />
										<DropDownGroup title="Popular Searches">
											{guideKeyword.data.popular.map((keyword, index) => {
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
