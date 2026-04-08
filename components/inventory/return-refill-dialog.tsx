"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRecordReturned } from "@/hooks/use-refills";
import { RefillBatch } from "@/types";

interface ReturnRefillDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  refill: RefillBatch | null;
}

function getCurrentDateTimeLocal() {
  const now = new Date();
  const timezoneOffset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

export function ReturnRefillDialog({ open, onOpenChange, refill }: ReturnRefillDialogProps) {
  const [returnDateTime, setReturnDateTime] = React.useState(getCurrentDateTimeLocal);
  const { mutate: recordReturned, isPending } = useRecordReturned();

  React.useEffect(() => {
    if (open) {
      setReturnDateTime(getCurrentDateTimeLocal());
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refill) return;

    recordReturned({
      id: refill.id,
      dateReturned: new Date(returnDateTime).toISOString(),
    }, {
      onSuccess: () => {
        onOpenChange(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Return Refill Batch</DialogTitle>
            <DialogDescription>
              Confirm that this refill batch has been returned with full cylinders.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="return-date-time">Return Date & Time</Label>
              <Input
                id="return-date-time"
                type="datetime-local"
                value={returnDateTime}
                max={getCurrentDateTimeLocal()}
                onChange={(e) => setReturnDateTime(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Defaults to today and the current time, but you can adjust it before confirming.
              </p>
            </div>
            {refill && (
              <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                <p className="font-medium">Batch #{refill.id}</p>
                <p className="text-muted-foreground">
                  {(refill.refill_batch_items || []).reduce((sum: number, item) => sum + item.quantity, 0)} units sent on {new Date(refill.date_sent).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Confirming..." : "Confirm Return"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}