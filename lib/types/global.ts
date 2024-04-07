// API Response Types
export interface ApiResponse<Data> {
	status: "success" | "fail";
	data: Data;
}

export interface InfiniteQueryType<Data> {
	pageParams: (undefined | number)[];
	pages: Data[];
}

// User Types Definitions
export interface UserData {
	username: string;
	avatar: string;
	created_at: string;
	fullname: string | null;
	email: string | null;
	birth_date: string | null;
	gender: string | null;
	country: string | null;
	follower_count: string | null;
}

export type UserJWT = {
	username: string;
	avatar: string;
	accessToken: string;
	refreshToken: string;
	accessTokenExpireTime: string;
	refreshTokenExpireTime: string;
};

// Sell Features Types Definitions
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
export type EditProductFormInput = Omit<SellFormInputType, "designer_id">;

// Products related Types Definitions
interface BaseProductData {
	prod_id: number;
	name: string;
	tags: string;
	desc: string;
	size: string;
	color: string;
	price: number;
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

interface MenswearProductData extends BaseProductData {
	department: "Menswear";
	category: keyof MenswearCategory;
}

interface WomenswearProductData extends BaseProductData {
	department: "Womenswear";
	category: keyof WomenswearCategory;
}

export type ProductData = MenswearProductData | WomenswearProductData;

interface BaseCategoryTree {
	Tops: string[];
	Bottoms: string[];
	Outerwear: string[];
	Footwear: string[];
	Accessories: string[];
}

export interface WomenswearCategoryTree extends BaseCategoryTree {
	Dresses: string[];
	"Bags & Lugguage": string[];
}

export interface MenswearCategoryTree extends BaseCategoryTree {
	Tailoring: string[];
}

export interface DeptCategoryTree {
	Menswear: MenswearCategoryTree;
	Womenswear: WomenswearCategoryTree;
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

interface DeptCategorySizePartial {
	Menswear: Partial<MenswearSizeType>;
	Womenswear: Partial<WomenswearSizeType>;
}

export type Condition = "New/Never Worn" | "Gently Used" | "Used" | "Very Worn";

export interface OriginTreeData {
	Department: ["Menswear", "Womenswear"];
	NewArrivals: null;
	Category: DeptCategoryTree;
	Sizes: DeptCategorySize;
	Designer: string[];
	Condition: Condition[];
}

export interface FilteredTreeData {
	Department: ("Menswear" | "Womenswear")[] | null;
	NewArrivals: null;
	Category: Partial<DeptCategoryTree>;
	Sizes: Partial<DeptCategorySizePartial>;
	Designer: string[];
	Condition: Condition[];
}

// interface CategoryFilterObj<C, D extends keyof C> {
// 	name: string;
// 	dept: D;
// 	cat: keyof C[D];
// }

// export interface TreeFilterType {
// 	newArrivals?: boolean;
// 	department?: ("Menswear" | "Womenswear")[];
// 	subCategory?: (
// 		| CategoryFilterObj<DeptCategory, "Menswear">
// 		| CategoryFilterObj<DeptCategory, "Womenswear">
// 	)[];
// 	sizes?: (
// 		| CategoryFilterObj<DeptCategorySize, "Menswear">
// 		| CategoryFilterObj<DeptCategorySize, "Womenswear">
// 	)[];
// 	designers?: string[];
// 	condition?: Condition[];
// }

export interface FilterOptionType {
	department?: ("Menswear" | "Womenswear")[] | null;
	category?: {
		Menswear?: (keyof MenswearCategory)[];
		Womenswear?: (keyof WomenswearCategory)[];
	};
}

// Get Size API Response Types
export interface SizeOptions {
	category_id: number;
	Size: {
		id: number;
		name: string;
	};
}

// Get Draft Product API Response Types
export type DraftProductData = WithNullableProperties<ProductData> & {
	status: "0";
	stock: 1;
	seller_name: string;
	created_at: string;
	updated_at: string;
};

type WithNullableProperties<T> = {
	[P in keyof T]: T[P] | null;
};

// Get Recently Viewed Product API Response Types
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

// Get Cart API Response Types
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

//Designer Api Response Types
export interface FeaturedDesignerData {
	id: number;
	name: string;
	logo: string;
	created_at: string;
	isFollow: boolean;
}

// Messages related Types Definitions
export interface ChatroomType {
	id: string;
	buyer_name: string;
	seller_name: string;
	text: string;
	last_message: number;
	last_sent_user_name: string;
	chatroom_avatar: string;
	link: string;
	read_at: string | null;
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
	content: {
		listing_name: string;
	};
	link: string;
	created_at: string;
	read_at: string | null;
}

export interface WebSocketData {
	username: string;
	product_id: number;
	listingOwner: string;
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
