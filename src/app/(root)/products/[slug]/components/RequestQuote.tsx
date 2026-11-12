'use client';

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { requestQuoteSchema, TRequestQuoteInput } from "@/components/validations/request-quote";
import { PRODUCT_IMG } from "@/lib/default-import";
import handleErrors, { ErrorResponse } from "@/lib/handle-error";
import { useCreateQuoteMutation } from "@/redux/service/request-quote";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FileText,
  Phone,
  User,
  MapPin,
  Package,
  MessageCircle,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Loader2,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { CURRENCY } from "@/lib/envSecret";

type Props = {
  title: string;
  image: string;
  productId: string;
  sku?: string;
  price?: number;
};

const RequestQuote = ({ image, title, productId, sku, price }: Props) => {
  const [open, setOpen] = useState(false);
  const [createQuote, { isLoading }] = useCreateQuoteMutation();

  const form = useForm<TRequestQuoteInput>({
    resolver: zodResolver(requestQuoteSchema),
    defaultValues: {
      productId: productId,
      request: {
        name: "",
        phone: "",
        whatsappNumber: "",
      },
      quantity: 1,
      location: {
        district: "",
        zipCode: "",
        address: "",
      },
      notes: "",
    },
  });

  useEffect(() => {
    if (productId) {
      form.setValue("productId", productId);
    }
  }, [productId, form]);

  const onSubmit = async (data: TRequestQuoteInput) => {
    try {
      await createQuote(data).unwrap();
      toast.success("আপনার কোটেশন রিকোয়েস্ট সফলভাবে জমা হয়েছে!", {
        description: "আমাদের প্রতিনিধি দ্রুততম সময়ে আপনার সাথে যোগাযোগ করবে।",
      });
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error(error);
      handleErrors(error as ErrorResponse);
    }
  };

  const nameError = form.formState.errors.request?.name;
  const phoneError = form.formState.errors.request?.phone;
  const quantityError = form.formState.errors.quantity;
  const addressError = form.formState.errors.location?.address;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="w-full h-11 px-4 rounded-lg text-xs sm:text-sm font-semibold transition-all border border-slate-200 bg-white text-slate-700 hover:border-[#ff7a00] hover:text-[#ff7a00] hover:bg-orange-50/40 cursor-pointer flex items-center justify-center gap-2 group"
        >
          <FileText className="w-4 h-4 text-slate-400 group-hover:text-[#ff7a00] transition-colors" />
          <span>পাইকারি বা বিশেষ কোটেশন চান? (Request Quote)</span>
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[560px] p-0 overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-none">
        {/* Modal Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 bg-gradient-to-b from-slate-50/60 to-white">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#ff7a00] shrink-0">
              <FileText className="w-5 h-5" />
            </div>

            <div>
              <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>Request a Quote (বিশেষ কোটেশন)</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-0.5">
                পাইকারি বা বাল্ক অর্ডারের জন্য রিকোয়েস্ট পাঠান। আমাদের টিম সেরা ডিসকাউন্ট নিয়ে যোগাযোগ করবে।
              </DialogDescription>
            </div>
          </div>

          {/* Product Preview Card */}
          <div className="mt-3.5 p-3 rounded-xl border border-slate-200 bg-white flex items-center gap-3">
            <div className="w-13 h-13 rounded-lg border border-slate-100 bg-slate-50 relative overflow-hidden shrink-0 flex items-center justify-center">
              <Image
                src={image || `/${PRODUCT_IMG}`}
                alt={title}
                width={52}
                height={52}
                className="object-cover w-full h-full"
              />
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                {title}
              </h4>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                {sku && (
                  <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
                    SKU: {sku}
                  </span>
                )}
                {price !== undefined && price > 0 && (
                  <span className="font-semibold text-slate-900">
                    বর্তমান মূল্য: {CURRENCY} {price.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Form */}
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="p-6 space-y-4 max-h-[calc(85vh-160px)] overflow-y-auto"
        >
          {/* Full Name */}
          <div className="space-y-1.5">
            <Label htmlFor="req-name" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>আপনার পুরো নাম <span className="text-rose-500">*</span></span>
            </Label>
            <Input
              id="req-name"
              placeholder="যেমন: মোঃ করিম হোসাইন"
              className="h-10 text-xs sm:text-sm border-slate-200 focus-visible:ring-[#ff7a00]"
              {...form.register("request.name")}
            />
            {nameError && (
              <p className="text-[11px] text-rose-500 font-medium">
                {nameError.message}
              </p>
            )}
          </div>

          {/* Phone & WhatsApp Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Phone */}
            <div className="space-y-1.5">
              <Label htmlFor="req-phone" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>ফোন নম্বর <span className="text-rose-500">*</span></span>
              </Label>
              <Input
                id="req-phone"
                type="tel"
                placeholder="017xxxxxxxx (১১ ডিজিট)"
                className="h-10 text-xs sm:text-sm border-slate-200 focus-visible:ring-[#ff7a00]"
                {...form.register("request.phone")}
              />
              {phoneError && (
                <p className="text-[11px] text-rose-500 font-medium">
                  {phoneError.message}
                </p>
              )}
            </div>

            {/* WhatsApp */}
            <div className="space-y-1.5">
              <Label htmlFor="req-whatsapp" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                <span>হোয়াটসঅ্যাপ নম্বর (ঐচ্ছিক)</span>
              </Label>
              <Input
                id="req-whatsapp"
                type="tel"
                placeholder="হোয়াটসঅ্যাপ নম্বর"
                className="h-10 text-xs sm:text-sm border-slate-200 focus-visible:ring-[#ff7a00]"
                {...form.register("request.whatsappNumber")}
              />
            </div>
          </div>

          {/* Quantity & District Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Quantity */}
            <div className="space-y-1.5">
              <Label htmlFor="req-quantity" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-slate-400" />
                <span>কত পিস প্রয়োজন? <span className="text-rose-500">*</span></span>
              </Label>
              <Input
                id="req-quantity"
                type="number"
                min={1}
                placeholder="যেমন: ১০"
                className="h-10 text-xs sm:text-sm border-slate-200 focus-visible:ring-[#ff7a00]"
                {...form.register("quantity")}
              />
              {quantityError && (
                <p className="text-[11px] text-rose-500 font-medium">
                  {quantityError.message}
                </p>
              )}
            </div>

            {/* District */}
            <div className="space-y-1.5">
              <Label htmlFor="req-district" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>জেলা (ঐচ্ছিক)</span>
              </Label>
              <Input
                id="req-district"
                placeholder="যেমন: ঢাকা, চট্টগ্রাম"
                className="h-10 text-xs sm:text-sm border-slate-200 focus-visible:ring-[#ff7a00]"
                {...form.register("location.district")}
              />
            </div>
          </div>

          {/* Full Address */}
          <div className="space-y-1.5">
            <Label htmlFor="req-address" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>আপনার সম্পূর্ণ ডেলিভারি ঠিকানা <span className="text-rose-500">*</span></span>
            </Label>
            <Input
              id="req-address"
              placeholder="রোড/বাড়ি নং, এলাকা বা থানা"
              className="h-10 text-xs sm:text-sm border-slate-200 focus-visible:ring-[#ff7a00]"
              {...form.register("location.address")}
            />
            {addressError && (
              <p className="text-[11px] text-rose-500 font-medium">
                {addressError.message}
              </p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="req-notes" className="text-xs font-bold text-slate-700">
              বিশেষ কোনো চাহিদা বা মন্তব্য (ঐচ্ছিক)
            </Label>
            <Textarea
              id="req-notes"
              rows={2}
              placeholder="আপনার নির্দিষ্ট কোনো ডেলিভারি সময় বা রিকোয়ারমেন্ট থাকলে লিখুন..."
              className="text-xs sm:text-sm border-slate-200 focus-visible:ring-[#ff7a00] resize-none"
              {...form.register("notes")}
            />
          </div>

          {/* Trust Guarantees */}
          <div className="pt-1">
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 bg-slate-50/80 p-2.5 rounded-lg border border-slate-100">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#ff7a00]" />
                <span>২৪ ঘণ্টার মধ্যে কল ব্যাক</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>তথ্য ১০০% গোপনীয়</span>
              </div>
            </div>
          </div>

          {/* Dialog Action Buttons */}
          <div className="pt-3 flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="w-1/3 h-11 text-xs sm:text-sm font-semibold border-slate-200 text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              বাতিল
            </Button>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-2/3 h-11 text-xs sm:text-sm font-bold bg-[#ff7a00] hover:bg-[#e06c00] text-white rounded-lg cursor-pointer flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>জমা হচ্ছে...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>কোটেশন রিকোয়েস্ট পাঠান</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RequestQuote;
