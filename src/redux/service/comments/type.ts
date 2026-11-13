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
  productId: { id: string; name: string },
  userId: { id: string; name: string },
  createdAt: string;

}

export interface ICommentListResponse extends IComment {
  data: IComment[];
   meta: IMetaPagination;
}