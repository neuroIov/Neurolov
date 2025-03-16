

"use client";

import React from 'react';
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import InputUS from './input';
import '@/app/fonts/index';
import { neus } from '@/app/fonts/index';
import { useTheme } from 'next-themes';
import axios from 'axios';

const formSchema = z.object({
  firstName: z.string().min(2, "First name is required").max(50),
  lastName: z.string().min(2, "Last name is required").max(50),
  username: z.string().min(2, "Username is required").max(30),
  email: z.string().email("Invalid email address"),
  location: z.string().optional(),
  // birthday: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, "Date must be in MM/DD/YYYY format"),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  if (data.newPassword && data.newPassword !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Passwords must match",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof formSchema>;

const UserSetting = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });
  const { theme } = useTheme();

  const onSubmit = (data: any) => {
    console.log("Form Data:", data);
  };

  return (
    <form 
      onSubmit={handleSubmit(onSubmit)}
      className={`px-8 pt-10 ${neus.variable} space-y-8 mx-auto rounded-full ${theme === "dark" ? 'text-white bg-gray-950' : 'bg-gray-400/20 text-gray-850'} p-8 rounded-lg shadow-md`}
    >
      {/* Header */}
      <h2 className="text-2xl font-bold">Profile Settings</h2>

      {/* First & Last Name */}
      <div className="grid grid-cols-2 gap-8">
        <div className={` space-y-2`}>
          <Label htmlFor="firstName">FIRST NAME</Label>
          <InputUS
            id="firstName"
            placeholder="Peter"
            {...register("firstName")}
            className={cn("", errors.firstName && "border-red-500")}
          />
          {errors.firstName && (
            <span className="text-red-500 text-sm">{errors.firstName.message}</span>
          )}
        </div>
        <div className={` space-y-2`}>
          <Label htmlFor="lastName">LAST NAME</Label>
          <InputUS
            id="lastName"
            placeholder="Griffin"
            {...register("lastName")}
            className={cn("", errors.lastName && "border-red-500")}
          />
          {errors.lastName && (
            <span className="text-red-500 text-sm">{errors.lastName.message}</span>
          )}
        </div>
      </div>

      {/* Username & Email */}
      <div className="grid grid-cols-2 gap-8">
        <div className={` space-y-2`}>
          <Label htmlFor="username">USERNAME*</Label>
          <InputUS
            id="username"
            placeholder="thepetergriffin"
            {...register("username")}
            className={cn("", errors.username && "border-red-500")}
          />
          {errors.username && (
            <span className="text-red-500 text-sm">{errors.username.message}</span>
          )}
        </div>
        <div className={` space-y-2`}>
          <Label htmlFor="email">EMAIL*</Label>
          <InputUS
            id="email"
            placeholder="hello@example.com"
            {...register("email")}
            className={cn("", errors.email && "border-red-500")}
          />
          {errors.email && (
            <span className="text-red-500 text-sm">{errors.email.message}</span>
          )}
        </div>
      </div>

      {/* Birthday & Location */}
      <div className="grid grid-cols-2 gap-8">
        <div className={` space-y-2`}>
          <Label htmlFor="birthday">BIRTHDAY*</Label>
          <InputUS
            id="birthday"
            placeholder="MM/DD/YYYY"
            type='date'
            // {...register("birthday")}
            // className={cn("", errors.birthday && "border-red-500")}
          />
          {/* {errors.birthday && (
            <span className="text-red-500 text-sm">{errors.birthday.message}</span>
          )} */}
        </div>
        <div className={` space-y-2`}>
          <Label htmlFor="location">LOCATION</Label>
          <InputUS
            id="location"
            placeholder="Quahog"
            {...register("location")}
            
          />
        </div>
      </div>

      {/* Password Update */}
      <h3 className="text-lg font-bold mt-4">CHANGE PASSWORD</h3>
      <div className="grid grid-cols-2 gap-8">
        <div className={` space-y-2`}>
          <Label htmlFor="currentPassword">CURRENT PASSWORD</Label>
          <InputUS
            id="currentPassword"
            type="password"
            {...register("currentPassword")}
            
          />
        </div>
        <div className={` space-y-2`}>
          <Label htmlFor="newPassword">NEW PASSWORD</Label>
          <InputUS
            id="newPassword"
            type="password"
            {...register("newPassword")}
            
          />
        </div>
        <div className={` space-y-2`}>
          <Label htmlFor="confirmPassword">CONFIRM PASSWORD</Label>
          <InputUS
            id="confirmPassword"
            type="password"
            {...register("confirmPassword")}
            className={cn("", errors.confirmPassword && "border-red-500")}
          />
          {errors.confirmPassword && (
            <span className="text-red-500 text-sm">{errors.confirmPassword.message}</span>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-center rounded-full ">
        <Button
          type="submit"
          disabled={isSubmitting}
          className={` rounded-full bg-green-400 hover:bg-green-300 ${theme === "dark" ? ' text-black' : 'text-white'} px-12 py-6  font-bold text-md`}
        >
          {isSubmitting ? "SAVING..." : "SAVE CHANGES"}
        </Button>
      </div>
    </form>
  );
};

export default UserSetting;
