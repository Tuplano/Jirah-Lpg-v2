"use client";

import Link from "next/link";
import { signUp } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleSubmit(formData: FormData) {
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirm-password") as string;

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);
    const result = await signUp(formData);
    
    if (result?.error) {
      toast.error(result.error);
      setIsLoading(false);
    } else if (result?.success) {
      toast.success(result.success);
      setIsSuccess(true);
      setIsLoading(false);
    }
  }

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4 font-sans">
        <Card className="w-full max-w-md shadow-xl border-primary/10 overflow-hidden text-center">
          <div className="h-2 bg-primary w-full" />
          <CardHeader className="pt-10 pb-6">
            <div className="flex justify-center mb-6">
              <div className="bg-primary/10 p-4 rounded-full text-primary animate-bounce">
                <CheckCircle2 className="h-12 w-12" />
              </div>
            </div>
            <CardTitle className="text-3xl font-black tracking-tight">Check Your Email</CardTitle>
            <CardDescription className="text-base font-medium px-4 mt-2">
              We&apos;ve sent a magic link to your email to verify your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-10">
            <Button asChild className="w-full h-12 font-bold mb-4">
              <Link href="/auth/login">Back to Login</Link>
            </Button>
            <p className="text-xs text-muted-foreground">
              Didn&apos;t receive any email? Check your spam folder or try again.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4 font-sans">
      <Card className="w-full max-w-md shadow-xl border-primary/10 overflow-hidden transition-all duration-300 hover:shadow-2xl">
        <div className="h-2 bg-primary w-full" />
        <CardHeader className="space-y-1 flex flex-col items-center pt-8 pb-6 text-center">
          <div className="bg-primary/10 p-4 rounded-2xl mb-4 transition-transform hover:scale-110 duration-300">
            <Flame className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl font-black tracking-tight text-foreground">Create Account</CardTitle>
          <CardDescription className="text-base font-medium text-muted-foreground">
            Join Jirah LPG and start tracking today
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                required
                disabled={isLoading}
                className="h-12 border-muted-foreground/20 focus-visible:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                disabled={isLoading}
                placeholder="••••••••"
                className="h-12 border-muted-foreground/20 focus-visible:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-sm font-semibold">Confirm Password</Label>
              <Input
                id="confirm-password"
                name="confirm-password"
                type="password"
                required
                disabled={isLoading}
                placeholder="••••••••"
                className="h-12 border-muted-foreground/20 focus-visible:ring-primary"
              />
            </div>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-12 text-sm font-bold bg-primary hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-[0.98] mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Get Started"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 border-t pt-6 pb-8 bg-muted/30">
          <div className="text-sm text-center text-muted-foreground font-medium">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-primary font-bold hover:underline underline-offset-4"
            >
              Sign In
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
