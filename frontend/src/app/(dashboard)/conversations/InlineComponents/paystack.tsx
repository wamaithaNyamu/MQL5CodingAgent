"use client"

import { CreditCard, User, Package, DollarSign, MailCheck, CheckCircle, XCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { PaystackButton } from 'react-paystack';
import { useSendPaymentStatus } from '@/hooks/useSendPaymentStatus';
import { useParams } from 'next/navigation';
import React, { memo, useState } from 'react';

const bounceAnimation = `
@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}
.animate-bounce-custom {
  animation: bounce 1s infinite;
}
`;
const PAYSTACK_PUBLIC_KEY_TEST = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY_TEST!

interface PaystackReference {
  reference: string;
  [key: string]: any;
}

interface PaymentComponentProps {
  userName?: string
  productName?: string
  productDescription?: string
  amount?: number
  currency?: string
  paystackEmail: string
  messageId: string;
  paymentStatus:boolean; // Prop from parent, reflecting message.paymentstatus
  onPaymentSuccess?: (reference: PaystackReference) => void
  onPaymentClose?: () => void
  onContinueConversationClick?: () => void;
}

const PaymentComponent = memo( ({
   userName = "John Doe",
  productName = "Premium Subscription",
  productDescription = "Access to all premium features including advanced analytics, priority support, and exclusive content for one year.",
  amount = 1000,
  currency = "USD",
  paystackEmail,
  messageId,
  paymentStatus, // Use this prop
  onPaymentSuccess = (reference) => console.log("Payment successful:", reference),
  onPaymentClose = () => console.log("Payment dialog closed")

}: PaymentComponentProps) => {

   const { conversationId } = useParams<{ conversationId: string }>();
  const { sendPaymentStatus, isUpdatingPaymentStatus } = useSendPaymentStatus(conversationId || '');

  const [isPaystackProcessing, setIsPaystackProcessing] = useState(false);
  const [localPaymentSuccess, setLocalPaymentSuccess] = useState(false);
  const [localPaymentFailed, setLocalPaymentFailed] = useState(false);
  const [paymentReference, setPaymentReference] = useState<string | null>(null);

  const finalAmount = amount === 0 ? 1 : amount;

  const formatCurrency = (value: number, curr: string) => {
    const displayAmount = value;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: curr,
    }).format(displayAmount);
  }

  // ✅ Derive button state, text, icon, and class directly from props/local state
  // Prioritize the 'paymentStatus' prop from the parent (Zustand message)
  let buttonIsDisabled = localPaymentSuccess || localPaymentFailed || isUpdatingPaymentStatus || paymentStatus;
  let buttonText = 'Complete Payment';
  let buttonIcon = <CreditCard className="mr-2 h-4 w-4" />;
  let buttonClassName = 'bg-primary text-primary-foreground hover:bg-primary/90';

  if (paymentStatus) { // Payment is already confirmed by the backend (and global state)
    buttonText = 'Payment Confirmed!';
    buttonIcon = <CheckCircle className="mr-2 h-4 w-4" />;
    buttonClassName = 'bg-green-600 hover:bg-green-700 text-white';
    buttonIsDisabled = true; // Ensure it's disabled if confirmed
  } else if (isUpdatingPaymentStatus) { // Payment is in progress (backend update)
    buttonText = 'Processing...';
    // You could add a spinner icon here if desired, e.g., <Loader2 className="mr-2 h-4 w-4 animate-spin" />
    buttonIsDisabled = true;
  } else if (localPaymentSuccess) { // Payment successful locally, but backend update might be pending
    buttonText = 'Payment Confirmed!';
    buttonIcon = <CheckCircle className="mr-2 h-4 w-4" />;
    buttonClassName = 'bg-green-600 hover:bg-green-700 text-white';
    buttonIsDisabled = true;
  } else if (localPaymentFailed) { // Payment failed locally
    buttonText = 'Payment Failed!';
    buttonIcon = <XCircle className="mr-2 h-4 w-4" />;
    buttonClassName = 'bg-red-600 hover:bg-red-700 text-white';
    buttonIsDisabled = true;
  }
  // else, default values defined at the start apply

  const config = {
    reference: (new Date()).getTime().toString(),
    email: paystackEmail,
    amount: finalAmount,
    publicKey: PAYSTACK_PUBLIC_KEY_TEST, // Use the appropriate key
    currency: currency
  };

  const componentProps = {
    ...config,
    // ✅ REMOVE THIS 'text' PROP! We are controlling content via children directly below.
    // text: 'Complete Payment',
    onSuccess: (reference: PaystackReference) => {
      setIsPaystackProcessing(false);
      setLocalPaymentSuccess(true); // Update local state for immediate feedback
      setPaymentReference(reference.reference);

      console.log(`Paystack Payment Successful. Reference:`, reference.reference);
      // ✅ Send payment success status to your backend
      sendPaymentStatus({
        messageID: messageId,
        paymentstatus: true,
        paymentfailed: false,
        paystackReference: reference.reference, // Ensure you pass just the string reference
      });

      onPaymentSuccess(reference); // Call original callback
    },
    onClose: () => {
      setIsPaystackProcessing(false);
      console.log("Paystack dialog closed by user.");
      onPaymentClose(); // Call original callback

      // ✅ OPTIONAL: If closing without success should mark as failed
      // if (!localPaymentSuccess) {
      //   setLocalPaymentFailed(true);
      //   sendPaymentStatus({ messageID: messageId, paymentstatus: false, paymentfailed: true });
      // }
    },
  };

  return (
    <div className="w-full  max-w-3xl pt-4">
      <style dangerouslySetInnerHTML={{ __html: bounceAnimation }} />

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Details
          </CardTitle>
          <CardDescription>Review your purchase before completing payment</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* ... Customer, Email, Product info ... */}
          <div className="flex items-center gap-3">
            <User className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Customer</p>
              <p className="text-sm text-muted-foreground">{userName}</p>
            </div>
          </div>

          <Separator />
          <div className="flex items-center gap-3">
            <MailCheck className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">{paystackEmail}</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Package className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">Product</p>
                <p className="font-semibold">{productName}</p>
              </div>
            </div>

            <div className="pl-7">
              <p className="text-sm text-muted-foreground leading-relaxed">{productDescription}</p>
            </div>
          </div>

          <Separator />

          {/* Amount */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Total Amount</span>
            </div>
            <span className="text-2xl font-bold">{formatCurrency(finalAmount, currency)}</span>
          </div>

          {/* Display payment reference if successful */}
          {localPaymentSuccess && paymentReference && (
            <div className="mt-4 flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              Payment Reference: <span className="font-medium">{paymentReference}</span>
            </div>
          )}
        </CardContent>

        <CardFooter className="pt-6">
          <PaystackButton
            {...componentProps}
            disabled={buttonIsDisabled} // Use the combined disabled state
            className={`w-full h-11 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${buttonClassName} px-8`}
          >
            {/* The icon and text are passed as children directly */}
            {buttonIcon}
            {buttonText}
          </PaystackButton>
        </CardFooter>
      </Card>
    </div>
  )
})

export { PaymentComponent }
export type { PaymentComponentProps, PaystackReference }