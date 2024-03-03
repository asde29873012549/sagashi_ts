export interface ApiResponse<Data> {
	status: "success" | "fail";
	data: Data;
}

export type PhotoBlobKey = "1" | "2" | "3" | "4" | "5" | "6";

type PhotoBlob = {
	[K in PhotoBlobKey]?: Blob | string;
};

export interface SellFormInputType {
	item_name: string;
	tags: string;
	desc: string;
	size: string;
	color: string;
	price: string;
	department: string;
	category: string;
	category_id: string;
	condition: string;
	subCategory: string;
	designer: string;
	designer_id: string;
	subCategory_id: string;
	size_id: string;
	photos: PhotoBlob;
}

export interface PartialSellFormInputType extends Partial<SellFormInputType> {}

export interface ProductData {
	prod_id: number;
	name: string;
	tags: string;
	desc: string;
	size: string;
	color: string;
	price: number;
	department: "Menswear" | "Womenswear";
	category: keyof MenswearCategory | keyof WomenswearCategory;
	condition: Condition;
	subCategory: string;
	designer: string;
	primary_image: string;
	secondary_image: string;
	seller_name: string;
	status: "1" | "0";
	stock: number;
	created_at: string;
	updated_at: string | null;
	discount?: number;
	sort?: [number];
}

export interface UserData {
	fullname: string | null;
	email: string | null;
	birth_date: string | null;
	gender: string | null;
	avatar: string;
	country: string | null;
	created_at: string;
	follower_count: string | null;
	username: string;
}

export interface SubCategorySubType {
	id: number;
	name: string;
}

export interface SubCategoryType {
	id: number;
	sub: SubCategorySubType[];
}

interface CommonCategory {
	Tops: SubCategoryType;
	Bottoms: SubCategoryType;
	Outerwear: SubCategoryType;
	Footwear: SubCategoryType;
	Accessories: SubCategoryType;
}

export interface WomenswearCategory extends CommonCategory {
	Dresses: SubCategoryType;
	"Bags & Lugguage": SubCategoryType;
}

export interface MenswearCategory extends CommonCategory {
	Tailoring: SubCategoryType;
}

export type MenswearSizeType = {
	[S in keyof MenswearCategory]: string[];
};

export type WomenswearSizeType = {
	[S in keyof WomenswearCategory]: string[];
};

export interface DeptCategory {
	Menswear: MenswearCategory;
	Womenswear: WomenswearCategory;
}

export interface DeptCategorySize {
	Menswear: MenswearSizeType;
	Womenswear: WomenswearSizeType;
}

export type Condition = "New/Never Worn" | "Gently Used" | "Used" | "Very Worn";

export interface OriginTreeData {
	Department: ["Menswear", "Womenswear"];
	NewArrivals: null;
	Category: DeptCategory;
	Sizes: DeptCategorySize;
	Designer: string[];
	Condition: Condition[];
}

export interface FilteredTreeData {
	Department: ("Menswear" | "Womenswear")[] | null;
	NewArrivals: null;
	Category: {
		Menswear?: MenswearCategory;
		Womenswear?: WomenswearCategory;
	};
	Sizes: {
		Menswear?: { [S in keyof MenswearCategory]?: string[] };
		Womenswear?: { [S in keyof WomenswearCategory]?: string[] };
	};
	Designer: string[];
	Condition: Condition[];
}

interface TreeFilterSubCategory<C, D extends keyof C> {
	name: string;
	dept: D;
	cat: keyof C[D];
}

interface TreeFilterSize<C, D extends keyof C> {
	name: string;
	dept: D;
	cat: keyof C[D];
}

export interface TreeFilterType {
	newArrivals?: boolean;
	department?: ("Menswear" | "Womenswear")[];
	subCategory?: (
		| TreeFilterSubCategory<DeptCategory, "Menswear">
		| TreeFilterSubCategory<DeptCategory, "Womenswear">
	)[];
	sizes?: (
		| TreeFilterSize<DeptCategorySize, "Menswear">
		| TreeFilterSize<DeptCategorySize, "Womenswear">
	)[];
	designers?: string[];
	condition?: Condition[];
}

export interface FilterOptionType {
	department?: ("Menswear" | "Womenswear")[] | null;
	category?: {
		Menswear?: (keyof MenswearCategory)[];
		Womenswear?: (keyof WomenswearCategory)[];
	};
}

export interface SizeType {
	category_id: number;
	Size: {
		id: number;
		name: string;
	};
}

export interface EditProductFormInput {
	item_name: string;
	tags: string;
	desc: string;
	size: string;
	color: string;
	price: string;
	department: string;
	category: string;
	category_id: string;
	condition: string;
	subCategory: string;
	designer: string;
	subCategory_id: string;
	size_id: string;
	photos: {
		[K in PhotoBlobKey]?: Blob | string;
	};
}

export interface DraftProductData {
	prod_id: number;
	name: string | null;
	price: string | null;
	condition: Condition | null;
	color: string | null;
	desc: string | null;
	tags: string | null;
	primary_image: string | null;
	secondary_image: string | null;
	status: "0";
	stock: 1;
	seller_name: string;
	created_at: string;
	updated_at: string;
	department: "Menswear" | "Womenswear" | null;
	category: keyof MenswearCategory | keyof WomenswearCategory | null;
	subCategory: string | null;
	designer: string | null;
	size: string | null;
}

export interface RecentlyViewedProductData {
	name: string;
	price: string;
	desc: string;
	created_at: string;
	primary_image: string;
	seller_name: string;
	Size: { name: string };
}

export interface RecentlyViewedProductDataType {
	product_id: number;
	seller_name: string;
	createdAt: string;
	updatedAt: string;
	Product: RecentlyViewedProductData;
}

export interface CartData {
	product_id: number;
	created_at: string;
	seller_name: string;
	product_name: string;
	price: string;
	desc: string | null;
	primary_image: string;
	Size: {
		name: string;
	};
	Discount: string | null;
	Designer: {
		name: string;
	};
	Offer?: string | null;
}

export type UserJWTtype = {
	username: string;
	avatar: string;
	accessToken: string;
	refreshToken: string;
	accessTokenExpireTime: string;
	refreshTokenExpireTime: string;
};

export interface ChatroomType {
	buyer_name: string;
	chatroom_avatar: string;
	id: string;
	last_message: number;
	last_sent_user_name: string;
	link: string;
	read_at: string | null;
	seller_name: string;
	text: string;
	updated_at: string;
}

interface MessageNotification {
	type: "notification.message";
	sender_name: string;
	buyer_name: string;
	seller_name: string;
	listing_id: string;
	text: string;
	image: string;
	created_at: string;
	link: string;
}

interface LikeNotification {
	id: string;
	type: "notification.like";
	sender_name: string;
	username: string;
	seller_name: string;
	listing_id: string;
	listing_name: string;
	text: string;
	image: string;
	created_at: string;
	link: string;
}

interface FollowNotification {
	id: string;
	type: "notification.follow";
	username: string;
	followed_user: string;
	image: string;
	created_at: string;
	link: string;
}

interface UploadListingNotification {
	id: string;
	type: "notification.uploadListing";
	username: string;
	listing_name: string;
	image: string;
	created_at: string;
	link: string;
}

export type OnlineNotification = LikeNotification | FollowNotification | UploadListingNotification;

export interface NotificationType {
	id: number;
	sender_name: string;
	receiver_name: string;
	type:
		| "notification.message"
		| "notification.like"
		| "notification.follow"
		| "notification.uploadListing";
	image: string;
	content: string;
	link: string;
	created_at: string;
	read_at: string | null;
}

export interface WebSocketData {
	username: string;
	product_id: number;
	listingOwner: string;
}

export interface InfiniteQueryType<Data> {
	pageParams: (undefined | number)[];
	pages: Data[];
}

export type Feature =
	| "My Profile"
	| "Messages"
	| "My Items"
	| "Drafts"
	| "My Address"
	| "Edit Address"
	| "My Language"
	| "My Country"
	| "Contact Us"
	| "Change Password"
	| "Edit Profile"
	| "Edit Address"
	| "Edit Language"
	| "Edit Countries";
