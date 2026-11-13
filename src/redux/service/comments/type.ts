import { IMetaPagination } from "@/types/common.type";

export interface IBaseComment {

  comment: string,
  rating: number,
  isApproved: boolean,
  isFeature: boolean,
}

export interface IComment extends IBaseComment {
  id: string;
  /** The product / user the review belongs to (the API puts the loaded rows here) */
  productId?: { id: string; name: string };
  userId?: { id: string; name: string };
  user?: { id?: string; name?: string; phone?: string; email?: string; photo?: string };
  product?: { id?: string; name?: string; slug?: string; thumbnail?: string; price?: number };
  createdAt: string;
}

export interface ICommentListResponse extends IComment {
  data: IComment[];
   meta: IMetaPagination;
}