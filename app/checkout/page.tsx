"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion"; // Impor framer-motion
import { ArrowLeft, Lock, MapPin, Upload, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CheckoutPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
  });
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [orderNumber, setOrderNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false); // State untuk loading

  useEffect(() => {
    const randomOrderNumber = Math.floor(10000 + Math.random() * 90000);
    setOrderNumber(`KDF-${randomOrderNumber}`);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPaymentProof(e.target.files[0]);
    }
  };

  const nextStep = () => {
    if (step < 3) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    nextStep();
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!paymentProof) {
      alert("Please upload payment proof before completing the purchase.");
      return;
    }

    setIsLoading(true); // Tampilkan loading

    const formDataToSend = new FormData();
    formDataToSend.append("orderNumber", orderNumber);
    formDataToSend.append("firstName", formData.firstName);
    formDataToSend.append("lastName", formData.lastName);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("phone", formData.phone);
    formDataToSend.append("address", formData.address);
    formDataToSend.append("city", formData.city);
    formDataToSend.append("state", formData.state);
    formDataToSend.append("zipCode", formData.zipCode);
    formDataToSend.append("amount", "600000");
    if (paymentProof) {
      formDataToSend.append("paymentProof", paymentProof);
    }

    const response = await fetch("/api/orders", {
      method: "POST",
      body: formDataToSend,
    });

    const result = await response.json();

    setIsLoading(false); // Sembunyikan loading

    if (response.ok) {
      nextStep();
    } else {
      alert("Failed to save order: " + result.error);
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          alert(
            `Location accessed! In a real app, this would auto-fill your address based on coordinates: ${position.coords.latitude}, ${position.coords.longitude}`
          );
        },
        (error) => {
          alert(`Error accessing location: ${error.message}`);
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>

        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <Image src="/images/dire-logo.png" alt="DIRE" width={150} height={60} className="h-auto mx-auto mb-6" />
            <h1 className="text-3xl font-bold">Dire Khadaffi Track Suit</h1>
          </div>

          <div className="mb-12">
            <div className="flex justify-between">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col items-center">
                  <div
                    className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium mb-2",
                      step >= i ? "bg-white text-black" : "bg-gray-800 text-gray-400"
                    )}
                  >
                    {i}
                  </div>
                  <span className={cn("text-sm", step >= i ? "text-white" : "text-gray-400")}>
                    {i === 1 ? "Details" : i === 2 ? "Payment" : "Confirmation"}
                  </span>
                </div>
              ))}
            </div>
            <div className="relative mt-4">
              <div className="absolute top-0 left-0 h-1 w-full bg-gray-800"></div>
              <div
                className="absolute top-0 left-0 h-1 bg-white transition-all duration-500"
                style={{ width: `${((step - 1) / 2) * 100}%` }}
              />
            </div>
          </div>

          {step === 1 && (
            <div className="bg-gray-900 rounded-2xl p-8 animate-fadeIn">
              <h2 className="text-2xl font-bold mb-6">Your Details</h2>
              <form onSubmit={handleStep1Submit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      required
                      className="bg-gray-800 border-gray-700 mt-1"
                      value={formData.firstName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      required
                      className="bg-gray-800 border-gray-700 mt-1"
                      value={formData.lastName}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    required
                    className="bg-gray-800 border-gray-700 mt-1"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <Label htmlFor="address" className="flex items-center justify-between">
                    <span>Shipping Address</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={getLocation}
                      className="text-xs flex items-center"
                    >
                      <MapPin className="h-3 w-3 mr-1" />
                      Auto-fill with GPS
                    </Button>
                  </Label>
                  <Input
                    id="address"
                    placeholder="123 Main St"
                    required
                    className="bg-gray-800 border-gray-700 mt-1"
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      placeholder="New York"
                      required
                      className="bg-gray-800 border-gray-700 mt-1"
                      value={formData.city}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State/Province</Label>
                    <Input
                      id="state"
                      placeholder="NY"
                      required
                      className="bg-gray-800 border-gray-700 mt-1"
                      value={formData.state}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="zipCode">Postal Code</Label>
                    <Input
                      id="zipCode"
                      placeholder="10001"
                      required
                      className="bg-gray-800 border-gray-700 mt-1"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="(123) 456-7890"
                    required
                    className="bg-gray-800 border-gray-700 mt-1"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="pt-4">
                  <Button type="submit" className="w-full rounded-full bg-white text-black hover:bg-opacity-90 py-6">
                    Continue to Payment
                  </Button>
                </div>
              </form>
            </div>
          )}

          {step === 2 && (
            <div className="bg-gray-900 rounded-2xl p-8 animate-fadeIn">
              <h2 className="text-2xl font-bold mb-6">Payment Information</h2>
              <p className="text-gray-400 mb-8">
                Please transfer the total amount to one of the following bank accounts:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                  <form onSubmit={handleStep2Submit} className="space-y-6">
                    <div className="space-y-6">
                      <div className="bg-gray-800 rounded-xl p-6">
                        <h3 className="font-bold mb-4">Bank Transfer Options</h3>

                        <div className="space-y-4">
                          <div className="border border-gray-700 rounded-lg p-4">
                            <div className="font-medium">BCA</div>
                            <div className="text-lg font-bold mt-1">1092275927</div>
                            <div className="text-sm text-gray-400">ALDI HAFFIZ PERMANA</div>
                          </div>

                          <div className="border border-gray-700 rounded-lg p-4">
                            <div className="font-medium">MANDIRI</div>
                            <div className="text-lg font-bold mt-1">1730016037401</div>
                            <div className="text-sm text-gray-400">ALDI HAFFIZ PERMANA</div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-800 rounded-xl p-6">
                        <h3 className="font-bold mb-4">Upload Payment Proof</h3>
                        <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center">
                          <div className="mb-4">
                            <Upload className="h-8 w-8 mx-auto text-gray-400" />
                          </div>
                          <p className="text-sm text-gray-400 mb-4">
                            Upload a screenshot or photo of your payment receipt
                          </p>
                          <Input
                            id="paymentProof"
                            type="file"
                            accept="image/*"
                            required
                            className="hidden"
                            onChange={handleFileChange}
                          />
                          <Label
                            htmlFor="paymentProof"
                            className="inline-block rounded-full bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600 cursor-pointer"
                          >
                            Select File
                          </Label>
                          {paymentProof && (
                            <p className="mt-2 text-sm text-green-500">File selected: {paymentProof.name}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-8">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={prevStep}
                        className="rounded-full border-gray-700 bg-transparent text-white hover:bg-gray-800"
                      >
                        Back
                      </Button>

                      <Button
                        type="submit"
                        className="relative rounded-full bg-white text-black hover:bg-opacity-90"
                        disabled={!paymentProof || isLoading}
                      >
                        {isLoading ? (
                          <div className="flex items-center">
                            <svg
                              className="animate-spin h-5 w-5 mr-2 text-black"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v8H4z"
                              />
                            </svg>
                            Processing...
                          </div>
                        ) : (
                          "Complete Purchase"
                        )}
                      </Button>
                    </div>
                  </form>
                </div>

                <div>
                  <div className="bg-gray-800 rounded-xl p-6 sticky top-8">
                    <h3 className="text-xl font-bold mb-4">Order Summary</h3>
                    <div className="flex items-center gap-4 border-b border-gray-700 pb-4 mb-4">
                      <div className="w-16 h-16 bg-gray-700 rounded-md overflow-hidden">
                        <Image
                          src="/images/tracksuit.png"
                          alt="Dire Khadaffi Track Suit"
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-medium">Dire Khadaffi Track Suit</h4>
                        <p className="text-sm text-gray-400">Size: M</p>
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>Rp 600,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping</span>
                        <span>Free</span>
                      </div>
                    </div>
                    <div className="flex justify-between font-bold border-t border-gray-700 pt-4 mb-6">
                      <span>Total</span>
                      <span>Rp 600,000</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-400">
                      <Lock className="h-3 w-3 mr-1" />
                      Secure checkout
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-gray-900 rounded-2xl p-8 text-center"
              >
                <div className="mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="h-20 w-20 rounded-full bg-gradient-to-r from-green-400 to-green-600 mx-auto flex items-center justify-center mb-6 shadow-lg"
                  >
                    <CheckCircle className="h-10 w-10 text-white" />
                  </motion.div>
                  <h2 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-600">
                    Order Confirmed!
                  </h2>
                  <p className="text-gray-400 max-w-md mx-auto">
                    Thank you for your purchase. Your Dire Khadaffi Track Suit will be shipped soon. We've sent a notification to our team for processing.
                  </p>
                </div>

                <div className="bg-gray-800 rounded-xl p-6 max-w-md mx-auto mb-8 shadow-md">
                  <h3 className="text-xl font-bold mb-4 text-white">Order Details</h3>
                  <div className="space-y-3 text-left">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Order Number</span>
                      <span className="text-white font-medium">{orderNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Product</span>
                      <span className="text-white font-medium">Dire Khadaffi Track Suit</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Amount</span>
                      <span className="text-white font-medium">Rp 600,000</span>
                    </div>
                  </div>

                  <div className="border-t border-gray-700 my-4 pt-4">
                    <h4 className="font-bold text-left mb-2 text-white">Buyer Information</h4>
                    <div className="text-left text-sm space-y-2">
                      <p>
                        <span className="text-gray-400">Name:</span>{" "}
                        <span className="text-white">{formData.firstName} {formData.lastName}</span>
                      </p>
                      <p>
                        <span className="text-gray-400">Email:</span>{" "}
                        <span className="text-white">{formData.email}</span>
                      </p>
                      <p>
                        <span className="text-gray-400">Phone:</span>{" "}
                        <span className="text-white">{formData.phone}</span>
                      </p>
                      <p>
                        <span className="text-gray-400">Address:</span>{" "}
                        <span className="text-white">
                          {formData.address}, {formData.city}, {formData.state} {formData.zipCode}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Button
                    className="w-full rounded-full bg-gradient-to-r from-green-400 to-green-600 text-white hover:from-green-500 hover:to-green-700 shadow-lg transition-all duration-300"
                    onClick={() => (window.location.href = "/")}
                  >
                    Return to Home
                  </Button>
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}