import { createSlice } from "@reduxjs/toolkit";

interface userState {
	user: {
		isRegisterFormActive: boolean;
	};
}

let initialState = {
	isRegisterFormActive: false,
};

const userSlice = createSlice({
	name: "user",
	initialState,
	reducers: {
		toggleRegisterForm: (state) => {
			state.isRegisterFormActive = !state.isRegisterFormActive;
		},
	},
});

export const { toggleRegisterForm } = userSlice.actions;
export const userSelector = (state: userState) => state.user;
export default userSlice.reducer;
