/** Redux states to simplify process for possible corrections after uploading funding file. */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Correction {
	row: string,
	sportCode: string,
	sportTitle: string,
	branchCode: string,
	branchTitle: string
}

interface CorrectionsState {
	corrections: Correction[]
}

const initialState: CorrectionsState = {
	corrections: []
};

export const correctionsSlice = createSlice({
	name: "suggestionRows",
	initialState,
	reducers: {
		setCorrections: (state, action: PayloadAction<Correction[]>) => {
			state.corrections = action.payload;
		},
		updateSportTitle: (state, action: PayloadAction<{row: string, sportTitle: string}>) => {
			const payload = action.payload;
			const correction: Correction | undefined = state.corrections.find(c => c.row === payload.row);
			if (correction !== undefined)
				correction.sportTitle = payload.sportTitle;
		},
		updateBranchTitle: (state, action: PayloadAction<{row: string, branchTitle: string}>) => {
			const payload = action.payload;
			const correction: Correction | undefined = state.corrections.find(c => c.row === payload.row);
			if (correction !== undefined)
				correction.branchTitle = payload.branchTitle;
		},
		updateBranchCode: (state, action: PayloadAction<{row: string, branchCode: string}>) => {
			const payload = action.payload;
			const correction: Correction | undefined = state.corrections.find(c => c.row === payload.row);
			if (correction !== undefined)
				correction.branchCode = payload.branchCode;
		},
		clearState: (state) => {
			state.corrections = [];
		}
	}
});

export const {
	setCorrections,
	updateSportTitle,
	updateBranchTitle,
	updateBranchCode,
	clearState
} = correctionsSlice.actions;

export default correctionsSlice.reducer;