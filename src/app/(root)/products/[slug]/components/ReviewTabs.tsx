'use client';

import ViewHTML from "@/components/shared/html-viewer/HTMLView";
import StarRating from "@/components/shared/StarRating";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetCommentByProductIdQuery } from "@/redux/service/comments";
import { IProduct } from "@/redux/service/products/type";
import { useGetAppSettingQuery } from "@/redux/service/setting";
import { formatDistanceToNow } from "date-fns";
import { CheckCircle2, FileText, MessageSquareQuote, Star, User } from "lucide-react";

type Props = {
  product: IProduct;
};

const ReviewTabs = ({ product }: Props) => {
  const { data: appSetting } = useGetAppSettingQuery();
  const { data: getComments } = useGetCommentByProductIdQuery(
    { productId: product?._id || '1', params: 'accessMode=public' },
    { skip: !product?._id }
  );
  const reviews = getComments?.data || [];

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
      : product.ratings?.average || 0;

  const ratings = [5, 4, 3, 2, 1].map((star) => {
    const totalReviews = reviews.filter((st) => st.rating === star).length;
    return {
      label: star,
      width: reviews.length > 0 ? (totalReviews / reviews.length) * 100 : 0,
      reviews: totalReviews,
    };
  });

  const formateDateRevalidate = (date: string) => {
    try {
      const formate = new Date(date);
      return formatDistanceToNow(formate, { addSuffix: true });
    } catch {
      return '';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <Tabs defaultValue="details" className="w-full">
        {/* Tabs Bar */}
        <div className="border-b border-slate-200 bg-slate-50/70 px-4 sm:px-6 pt-3">
          <TabsList className="bg-slate-200/60 p-1 rounded-xl h-auto flex flex-wrap gap-1 max-w-md">
            <TabsTrigger
              value="details"
              className="flex-1 py-2.5 px-4 rounded-lg font-bold text-xs sm:text-sm text-slate-600 data-[state=active]:bg-white data-[state=active]:text-orange-600 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>পণ্যের বিবরণ</span>
            </TabsTrigger>

            {appSetting?.features?.review && (
              <TabsTrigger
                value="reviews"
                className="flex-1 py-2.5 px-4 rounded-lg font-bold text-xs sm:text-sm text-slate-600 data-[state=active]:bg-white data-[state=active]:text-orange-600 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageSquareQuote className="w-4 h-4" />
                <span>রিভিউ ({reviews?.length || 0})</span>
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        {/* ------------------------------------------------------------------- */}
        {/* TAB 1: PRODUCT DETAILS                                              */}
        {/* ------------------------------------------------------------------- */}
        <TabsContent value="details" className="mt-0 p-5 sm:p-8">
          <div className="max-w-4xl space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">
              {product?.name} - এর বিস্তারিত বিবরণ
            </h2>

            {product?.description ? (
              <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-sm sm:text-base">
                <ViewHTML htmlText={product.description} />
              </div>
            ) : (
              <p className="text-slate-500 text-sm">কোন বিস্তারিত তথ্য পাওয়া যায়নি।</p>
            )}
          </div>
        </TabsContent>

        {/* ------------------------------------------------------------------- */}
        {/* TAB 2: RATINGS & REVIEWS                                            */}
        {/* ------------------------------------------------------------------- */}
        <TabsContent value="reviews" className="mt-0 p-5 sm:p-8">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                গ্রাহকদের রিভিউ ও রেটিং
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                {product?.name} ব্যবহারকারীদের মতামত
              </p>
            </div>

            {/* Rating Summary Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-5 sm:p-6 rounded-xl bg-slate-50/70 border border-slate-200">
              {/* Left Score Box */}
              <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-4 border-b md:border-b-0 md:border-r border-slate-200">
                <div className="text-4xl sm:text-5xl font-black text-slate-900">
                  {avgRating.toFixed(1)}
                  <span className="text-lg sm:text-xl text-slate-400 font-normal">/5</span>
                </div>

                <div className="flex items-center gap-1 text-amber-400 my-2">
                  <StarRating value={avgRating} />
                </div>

                <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                  {avgRating >= 4.5
                    ? 'টপ রেটেড'
                    : avgRating >= 4.0
                    ? 'চমৎকার'
                    : avgRating >= 3.0
                    ? 'ভালো'
                    : 'সাধারণ'}
                </span>

                <p className="text-xs text-slate-500 mt-2">
                  মোট {reviews?.length || 0} জন গ্রাহকের রিভিউ
                </p>
              </div>

              {/* Right Bars */}
              <div className="md:col-span-8 flex flex-col justify-center space-y-2">
                {ratings.map((star) => (
                  <div key={star.label} className="flex items-center gap-3 text-xs sm:text-sm">
                    <div className="flex items-center gap-1 w-12 shrink-0 text-slate-600 font-medium">
                      <span>{star.label}</span>
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    </div>

                    <div className="flex-1 h-2.5 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full bg-orange-500 rounded-full transition-all duration-300"
                        style={{ width: `${star.width}%` }}
                      />
                    </div>

                    <span className="w-8 text-right text-slate-500 font-medium shrink-0">
                      {star.reviews}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Reviews List */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                সাম্প্রতিক রিভিউসমূহ
              </h3>

              {reviews && reviews.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {reviews.map((review, index) => (
                    <div key={index} className="py-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs shrink-0">
                            {review?.userId?.name ? review.userId.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-sm text-slate-900">
                                {review?.userId?.name || 'ভেরিফাইড ক্রেতা'}
                              </span>
                              <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3" />
                                ভেরিফাইড
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400">
                              {review?.createdAt ? formateDateRevalidate(review.createdAt) : ''}
                            </span>
                          </div>
                        </div>

                        <StarRating size={13} value={review?.rating} />
                      </div>

                      <p className="text-slate-700 text-sm pl-10 leading-relaxed">
                        {review?.comment}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
                  <MessageSquareQuote className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-600 font-semibold text-sm">এই পণ্যের জন্য এখনো কোন রিভিউ দেওয়া হয়নি</p>
                  <p className="text-slate-400 text-xs mt-1">পণ্যটি কিনে আপনার মূল্যবান অভিজ্ঞতা শেয়ার করুন</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReviewTabs;
