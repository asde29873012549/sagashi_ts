import { createSlice } from "@reduxjs/toolkit";

interface loadingState {
	loading: {
		active: boolean;
	};
}

let initialState = {
	active: false,
};

const loadingSlice = createSlice({
	name: "loading",
	initialState,
	reducers: {
		activate: (state) => {
			state.active = !state.active;
		},
	},
});

export const { activate } = loadingSlice.actions;
export const loadingSelector = (state: loadingState) => state.loading;
export default loadingSlice.reducer;
