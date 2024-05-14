const genericError = "Encounter temporary error. Please try again later.";
const unAuthorizedError = {
	title: "Unauthorized",
	desc: "You may need to login or your session has expired.",
	status: "fail",
};

const loginError = {
	notExist: "The username provided does not exist, please register.",
	wrongCredential: "Wrong username or password.",
	emptyFields: "Empty Username or Password",
};

const uploadSuccess = {
	title: "Uploaded !",
	desc: "You are ready to go !",
	status: "success",
};

const uploadImageFailure = {
	title: "Failed !",
	desc: "Encountered error while uploading Image !",
	status: "fail",
};

const saveDraftSuccess = {
	title: "Success !",
	desc: "Find your drafts in your profile > drafts .",
	status: "success",
};

const submitEmptyDraft = {
	title: "Warning !",
	desc: "Saving empty draft is not allowed .",
	status: "fail",
};

const personalInfoUpdateSuccess = {
	title: "Success !",
	desc: "Your personal information has been updated.",
	status: "success",
};

const addShoppingCartSuccess = {
	title: "Success !",
	desc: "Product added to shopping cart",
	status: "success",
};

const deleteSuccess = {
	title: "Success !",
	desc: "Product deleted",
	status: "success",
};

const accountCreated = {
	title: "Account Created",
	desc: "Your account has been created successfully. Please Sign In",
	status: "success",
};

const duplicateOffer = {
	title: "Forbidden",
	desc: "You have already made an offer",
	status: "fail",
};

export {
	genericError,
	unAuthorizedError,
	loginError,
	uploadSuccess,
	saveDraftSuccess,
	submitEmptyDraft,
	personalInfoUpdateSuccess,
	addShoppingCartSuccess,
	deleteSuccess,
	accountCreated,
	duplicateOffer,
	uploadImageFailure,
};
