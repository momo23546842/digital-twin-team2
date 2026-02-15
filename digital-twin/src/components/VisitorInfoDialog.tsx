"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface VisitorInfo {
  name?: string;
  email?: string;
  company?: string;
  role?: string;
  phone?: string;
}

interface VisitorInfoDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (info: VisitorInfo) => void;
}

export default function VisitorInfoDialog({
  open,
  onClose,
  onSubmit,
}: VisitorInfoDialogProps) {
  const [formData, setFormData] = useState<VisitorInfo>({
    name: '',
    email: '',
    company: '',
    role: '',
    phone: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof VisitorInfo, string>>>({});

  const validate = (): boolean => {
    const next: Partial<Record<keyof VisitorInfo, string>> = {};
    if (!formData.email || formData.email.trim().length === 0) {
      next.email = 'Email is required';
    } else {
      // basic email check
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!re.test(formData.email)) next.email = 'Enter a valid email address';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(formData);
    onClose();
  };

  const handleChange = (field: keyof VisitorInfo) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share Your Contact Info</DialogTitle>
          <DialogDescription>
            Help me learn more about you! This information allows me to provide
            better assistance and follow up with you.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Your name"
              value={formData.name}
              onChange={handleChange('name')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@company.com"
              value={formData.email}
              onChange={handleChange('email')}
              required
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              placeholder="Your company"
              value={formData.company}
              onChange={handleChange('company')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Input
              id="role"
              placeholder="e.g., Recruiter, Hiring Manager"
              value={formData.role}
              onChange={handleChange('role')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={formData.phone}
              onChange={handleChange('phone')}
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Skip
            </Button>
            <Button type="submit">Share Contact</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
