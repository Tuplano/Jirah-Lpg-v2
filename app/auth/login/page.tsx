"use client";

import Link from "next/link";
import { signIn } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    const result = await signIn(formData);
    
    if (result?.error) {
      toast.error(result.error);
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4 font-sans">
      <Card className="w-full max-w-md shadow-xl border-primary/10 overflow-hidden transition-all duration-300 hover:shadow-2xl">
        <div className="h-2 bg-primary w-full" />
        <CardHeader className="space-y-1 flex flex-col items-center pt-8 pb-6">
          <div className="bg-primary/10 p-4 rounded-2xl mb-4 transition-transform hover:scale-110 duration-300">
            <Flame className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl font-black tracking-tight text-foreground">Jirah LPG</CardTitle>
          <CardDescription className="text-base font-medium text-muted-foreground">
            Sign in to manage your inventory
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <form action={handleSubmit} className="space-y-5">
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs font-bold text-primary hover:text-primary/80 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                required
                disabled={isLoading}
                className="h-12 border-muted-foreground/20 focus-visible:ring-primary"
              />
            </div>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-12 text-sm font-bold bg-primary hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 border-t pt-6 pb-8 bg-muted/30">
          <div className="text-sm text-center text-muted-foreground font-medium">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/signup"
              className="text-primary font-bold hover:underline underline-offset-4"
            >
              Create account
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
