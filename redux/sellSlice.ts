import { PartialSellFormInputType } from "@/lib/types/global";
import { createSlice } from "@reduxjs/toolkit";

interface sellState {
	sell: {
		progress: number;
		formInput: PartialSellFormInputType;
		tags: { id: string; value: string }[];
	};
}

let initialState: {
	progress: number;
	formInput: PartialSellFormInputType;
	tags: { id: string; value: string }[];
} = {
	progress: 5,
	formInput: {},
	tags: [],
};

const sellSlice = createSlice({
	name: "sell",
	initialState,
	reducers: {
		makeProgress: (state, action) => {
			state.progress = action.payload;
		},
		mobileFormInput: (state, action) => {
			state.formInput = { ...state.formInput, [action.payload.key]: action.payload.value };
		},
		mobileInputTags: (state, action) => {
			state.tags = [...state.tags, action.payload];
		},
		mobileRemoveTags: (state, action) => {
			state.tags = state.tags.filter((obj) => obj.id !== action.payload);
		},
	},
});

export const { makeProgress, mobileFormInput, mobileInputTags, mobileRemoveTags } =
	sellSlice.actions;
export const sellSelector = (state: sellState) => state.sell;
export default sellSlice.reducer;
