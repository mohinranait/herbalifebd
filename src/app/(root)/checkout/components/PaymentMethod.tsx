import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CreditCard, Truck } from 'lucide-react';
import Image from 'next/image';
import { TMethodList } from '../page';
import { TPaymentMethod } from '@/redux/service/orders/type';

type Props = {
  paymentMethod: TPaymentMethod;
  callBack: (val: TPaymentMethod) => void;
  paymentMethodss: TMethodList[];
};

const PaymentMethod = ({ paymentMethod, callBack, paymentMethodss }: Props) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 space-y-4">
      {/* Title */}
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-brand-light text-brand flex items-center justify-center">
          <CreditCard className="w-4 h-4" />
        </div>
        <h2 className="text-base md:text-lg font-bold text-slate-800">
          পেমেন্ট মেথড বেছে নিন
        </h2>
      </div>

      <RadioGroup
        value={paymentMethod}
        onValueChange={(v) => callBack(v as "COD" | "BKASH")}
        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
      >
        {paymentMethodss.map((method) => {
          const isSelected = paymentMethod === method.value;
          return (
            <label
              key={method.value}
              className={`flex items-center gap-3 border rounded-xl p-3.5 cursor-pointer transition-all ${
                isSelected
                  ? "border-2 border-brand bg-brand-light text-slate-900 shadow-xs"
                  : "border-slate-200 hover:border-slate-300 bg-white text-slate-700"
              }`}
            >
              <RadioGroupItem value={method.value} />
              {method?.icon ? (
                <div className="w-10 h-7 relative flex items-center justify-center shrink-0">
                  <Image
                    src={`/${method.icon}`}
                    width={40}
                    height={28}
                    alt={method.label}
                    className="max-h-7 w-auto object-contain"
                  />
                </div>
              ) : (
                <Truck className="w-5 h-5 text-brand shrink-0" />
              )}
              <div className="min-w-0">
                <span className="font-semibold text-xs md:text-sm block">
                  {method.label}
                </span>
                <span className="text-[11px] text-slate-500 block">
                  {method.value === "COD" ? "পণ্য হাতে পেয়ে টাকা পরিশোধ করুন" : "মোবাইল ব্যাংকিং"}
                </span>
              </div>
            </label>
          );
        })}
      </RadioGroup>
    </div>
  );
};

export default PaymentMethod;
